<!-- Main Layout Template for Pages -->
<?php if(!isset($_SESSION)) session_start(); ?>
<?php require_once('includes/header.php') ?>
<?php require_once('commons/navleft.php') ?>


    <!-- BEGIN: Page Main-->
    <div id="main">
      <div class="row">
        <div class="content-wrapper-before blue-grey lighten-5"></div>
        <div class="col s12">
          <div class="container">
            <div class="section">
                <!-- Body -->
                <?php require_once($page) ?>       
                <!-- START RIGHT SIDEBAR NAV -->
                <?php //require_once('../../../../../includes/navright.php') ?>
                <!-- END RIGHT SIDEBAR NAV -->

                <!-- Intro -->
                <!---->
                <?php if(isset($_SESSION['user']['circulars']) && !is_null($_SESSION['user']['circulars']) && count($_SESSION['user']['circulars']) > 0){ ?>
                <div id="intro">
                    <div class="row">
                        <div class="col s12">

                            <div id="img-modal" class="modal white noticemodal">
                                <div class="modal-content">
                                    <a href="intro_close" class="modal-header right modal-close">
                                        CLOSE <span class="right"><i class="material-icons right-align">clear</i></span>
                                    </a>
                                    <div class="carousel carousel-slider center intro-carousel">
                                        <div class="carousel-fixed-item center middle-indicator hide">
                                            <div class="left">
                                                <button class="movePrevCarousel middle-indicator-text btn-small btn-flat red-text text-darken-2 waves-effect waves-light btn-prev">
                                                    <i class="material-icons">navigate_before</i> <span class="hide-on-small-only">Prev</span>
                                                </button>
                                            </div>

                                            <div class="right">
                                                <button class=" moveNextCarousel middle-indicator-text btn-small btn-flat ed-text text-darken-2 waves-effect waves-light btn-next">
                                                    <span class="hide-on-small-only">Next</span> <i class="material-icons">navigate_next</i>
                                                </button>
                                            </div>
                                        </div>
                                         
                                        <?php 
                                            $i = 1;
                                             foreach($_SESSION['user']['circulars'] as $row){
                                        ?>
                                        <div class="carousel-item slide-<?= $i ?>">
                                            <h6 class="intro-step-title mt-7 animated fadeInUp light-blue-text text-darken-3"><strong>CC : <?= $row['copied'] ?></strong></h6>
                                            <div class="card hoverable">
                                                <div class="card-header light-blue darken-3">
                                                   <h6 class="text-white" style="padding:7px 5px; color:white;font-weight:bolder;">UNIVERSITY CIRCULARS & NOTICES</h6>
                                                </div>
                                                <div class="card-image">
                                                    <img src="http://localhost:8500/cdn/images/bg1.png" height="100px">
                                                    <!--<span class="card-title">School Breaks Tommorro at 5 PM</span>-->
                                                    <a class="btn-floating btn-large pulse halfway-fab waves-effect waves-light red darken-3" target="_blank" href="../../public/vendors/pdfjs/web/viewer.html?file=<?= $row['attachment'] ?>"><i class="material-icons">picture_as_pdf</i></a>
                                                </div>
                                                <div class="card-content">
                                                   <p style="font-weight:bolder;"><b><?= $row['subject'] ?></b></p>
                                                </div>
                                                <div class="card-action">
                                                   <small style="font-weight:bolder;color:brown;font-size:15px;"><b>POSTED ON: <?= strtoupper($row['created_at']) ?></b></small>
                                                </div>
                                            </div>
                                        </div>
                                        <?php $i++; } ?>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <?php } ?>
                <!-- / Intro -->

          </div>
          <div class="content-overlay"></div>
        </div>
      </div>
    </div>

<div id="theme-cutomizer-out" class="sidenav row theme-cutomizer">
   <div class="col s12">
      <a class="sidenav-close display-none text-danger" href="#!"><i class="material-icons">close</i></a>
      <!-- Box content -->
      <span class="page-box"></span>
      <!-- / Box content end-->
   </div>
</div>

<?php require_once('includes/footer.php') ?>