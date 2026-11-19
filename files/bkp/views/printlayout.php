<!-- Main Layout Template for Pages -->
<?php // if(!isset($_SESSION)) session_start(); 
?>
<?php require_once('commons/printheader.php') ?>


<!-- BEGIN: Page Main-->
<div id="main">
  <div class="row">
    <div class="blue-grey lighten-5"></div>
    <div class="col s12">
      <!-- Body -->
      <?php require_once($page) ?>
      <!-- / Intro -->

      <div class="content-overlay"></div>
    </div>
  </div>
</div>

<?php //require_once('commons/footer.php') 
?>