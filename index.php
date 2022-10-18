<?php
// debug on
error_reporting(E_ALL);
ini_set('display_errors', '1');
header('Content-Type: text/html; charset=utf-8');


$allowedOrigins = [
    'http://localhost',
    'app://obsidian.md' ,
    'capacitor://localhost' ,
 ];
 if(in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins))
 {
     $http_origin = $_SERVER['HTTP_ORIGIN'];
 } else {
     $http_origin = "app://obsidian.md";
 }
header("Access-Control-Allow-Origin: $http_origin");
header("Access-Control-Allow-Headers: Content-Type, origin");


// Check for extensions

if (!extension_loaded('gd')) {
    echo '❌ Error: Please install php extension: gd';
    die;
}

if (!extension_loaded('zip')) {
    echo '❌ Error: Please install php extension: zip';
    die;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
require 'TPEpubCreator.php';
include 'parsedown.php';
include 'parsdownExtra.php';
$Parsedown = new ParsedownExtra();
$date = date('d.m.y H-i-s');
$text = $Parsedown->text($_POST['text']);
$_POST['text'] = $text;

// add unique id to the h1, h2, h3
$text = preg_replace_callback('/<h([1-3])>(.*?)<\/h[1-3]>/', function($matches1) {
    $id = 'title_'.uniqid();
    return '<h'.$matches1[1].' id="'.$id.'">'.$matches1[2].'</h'.$matches1[1].'>';
}, $text);
// replace all carets
$text = preg_replace('/<div class="footnotes">\n<hr \/>/', '<div class="footnotes">', $text);
$text = preg_replace('/\^(.*?)</', '<', $text);
// replace all between &&
$text = preg_replace('/%%(.*?)%%/', '', $text);
// do the close tag after an image
$text = preg_replace_callback('/<img(.*?)>/', function($image) {
    return '<img' . $image[1]. '></img>';
}, $text);
// make links from headers
$toc = '';
$number = 1;
preg_replace_callback('/<h([1-3]) id="(.*?)">(.*?)<\/h[1-3]>/', function($matches3) use (&$toc , &$number)  {
    $number = $number + 1;
    $toc .= '<a href="page'.$number.'.xhtml">'.$matches3[3].'</a><br />';
}, $text);

$_POST['text'] = $text;

$epub = new TPEpubCreator();

if (!file_exists('uploads')) {
    mkdir('uploads', 0777, true);
}
if (!file_exists('temp_folder')) {
    mkdir('temp_folder', 0777, true);
}
if (!file_exists('epubs')) {
    mkdir('epubs', 0777, true);
}


$epub->temp_folder = 'temp_folder/';
$epub->epub_file = 'epubs/'. $_POST['title'] .'.epub';


$epub->title = $_POST['title'];
$epub->creator = $_POST['author'];
$epub->language = $_POST['lang'];
$epub->rights = 'Public Domain';
$epub->publisher = 'Obsidian';

$epub->css = file_get_contents('base.css');
        
        $cover = imagecreatefromstring(file_get_contents('obsidian-kindle-export-2022.png'));
        $text_color = imagecolorallocate($cover, 0, 0, 0);
        imagettftext($cover, 50, 0, 5, 220, $text_color, 'fonts/Tahu!.ttf', $_POST['title']);
        imagettftext($cover, 40, 0, 5, 100, $text_color, 'fonts/Karu-ExtraLight.ttf', $_POST['author']);
        imagettftext($cover, 30, 0, 5, 1550, $text_color, 'fonts/Karu-ExtraLight.ttf', 'OBSIDIAN');
        // save image to file
        imagepng($cover, 'uploads/obsidian-kindle-export-2022.png');
        $epub->AddImage( 'uploads/obsidian-kindle-export-2022.png', false, true );

        if ($_POST['Bilder'] != ''){

            $Bilder = explode(',', $_POST['Bilder']);
            for ($i = 0; $i < count($Bilder); $i++) {
                file_put_contents('uploads/'.$Bilder[$i], base64_decode($_POST['file'.$i]));
                $epub->AddImage( 'uploads/'.$Bilder[$i], false, false );
                }
            }




        if ($_POST['toc'] == 'true') {
            if ($_POST['lang'] != 'de') {
                 $epub->AddPage("<h1>Content</h1>" . $toc , false, 'Content' );
            } else {
                $epub->AddPage("<h1>Inhalt</h1>" . $toc , false, 'Inhalt' );
            }
        }
        else{}

// if text contains <h

$pages = explode('<h', $text);	
foreach ($pages as $page) {
    if ($page != '') {
        // replace <i> and <b>
        $pagewoi = preg_replace_callback('/<i>(.*?)<\/i>/', function($matches5) {
            return $matches5[1];
        }, $page);
        $headline = strpos($pagewoi, '>');
        $headline = substr($pagewoi, $headline + 1);
        $headline = substr($headline, 0, strpos($headline, '<'));
        $epub->AddPage('<h' . $page, false, $headline);
    }
}



// $epub->AddPage($text, false, $_POST['title']);



 

        if ( ! $epub->error ) {

            // Since this can generate new errors when creating a folder
            // We'll check again
            $epub->CreateEPUB();
            
            // If there's no error here, you're e-book is successfully created
            if ( ! $epub->error ) {
                
                if(isset($_POST['title'])) 
                { 
                    
                  
                  
                    $mail = new PHPMailer(true);
                    $mail->CharSet = 'UTF-8';
                    
                    try {
                        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
                        $mail->isSMTP();                                            //Send using SMTP
                        $mail->Host       = $_POST['host'];                     //Set the SMTP server to send through
                        $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
                        $mail->Username   = $_POST['user'];                     //SMTP username
                        $mail->Password   = $_POST['pass'];                               //SMTP password
                        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
                        $mail->Port       = intval($_POST['port']);                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
                    
                    
                        $mail->setFrom($_POST['email'], $_POST['author']);
                        $mail->addAddress($_POST['kindle'] , $_POST['author']);     // Add a recipient
                        // $mail->addReplyTo('sstanek@ebmuc.de', 'Simeon Stanek');
                        // $mail->addBCC('sstanek@ebmuc.de');
                        // rename file to title.png
                        $mail->addAttachment('epubs/' . $_POST['title'].'.epub');
                
                        // $mail->isHTML(true);                                
                        $mail->Subject = $_POST['title'];
                        $mail->Body    = ' ';
                        $mail->send();
                        if ($_POST['lang'] != 'de') {
                            echo '👍 Your Ebook has been sent!';
                        } else {
                            echo '👍 Ebook wurde versandt!';
                        }               
                        unlink('epubs/' . $_POST['title'].'.epub');
                        $files = glob('uploads/*'); // get all file names
                        foreach($files as $file){ // iterate files
                            if(is_file($file))
                                unlink($file); // delete file
                        }
                        $file = fopen("counter.log", "a");
                        fwrite($file, $date . "\n");
                        $lines = file('counter.log');
                        $count = count($lines);
                        fclose($file);
                        $file = fopen("counter", "w");
                        fwrite($file, '
                        {
                            "schemaVersion": 1,
                            "label": "Books exported",
                            "message": "'.$count.'",
                            "color": "brightgreen"
                          }');
                        fclose($file);



                    } catch (Exception $e) {
                        if ($_POST['lang'] != 'de') {
                            echo "👎 Your Ebook could not be sent! Just try it again!😊 Error: {$mail->ErrorInfo}";
                        } else {
                            echo "👎 Ebook wurde nicht versandt! Versuchs einfach nochmal!😊 Error: {$mail->ErrorInfo}" ;
                        }
                        unlink('epubs/' . $_POST['title'].'.epub');
                        // delete all files in uploads folder
                        $files = glob('uploads/*'); // get all file names
                        foreach($files as $file){ // iterate files
                            if(is_file($file))
                                unlink($file); // delete file
                        }

                    }
        
                }


            }
            
        } else {
            // If for some reason you're e-book hasn't been created, you can see whats
            // going on
            echo $epub->error;
        }
     




        die;
?>
