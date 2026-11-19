<?php 
if(!isset($_SESSION)){
  session_start();
}

// Assets Management Module
$app->get('/docs', function () use ($app) {
   require './config/db.php';
   $app->render('mainlayout.php',[
       'page' => 'pages/docum/docbox.php',
       'slug' => 'docs'
   ]);
});

