
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12">
          <h5 class="light-blue-text text-darken-4 mt-5">Apply for Contract Renewal/Confirmation</h5>
          <hr>
            </div>
        </div>
    </div>    
    <div class="container-fluid">       
        <div class="row clearfix">
            <div class="col-lg-12 col-sm-12 col-md-12 card bg-light">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="card bg-secondary">
                            <div class="body text-white">
                                <div class="header">
                                    <h2><strong>CONTRACT</strong> RENEWAL/CONFIRMATION</h2>
                                </div>
                                
                                <div class="img-post m-b-15">
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                    <!-- <form action="<?php //echo URLROOT; ?>/users/send_promo" id="frmFileUpload" method="post"> -->
                                    <form id="frmFileUpload" method="post">
                                    <input type="hidden" name="apply_type" id="apply_type" value='1'>
                                    <div>
                                    <strong>SELECT JOB RANK</strong>
                                    <!--<label for="position">SELECT POSITION</label>-->
                                    <select class="d-block" style="width:100%;" name="position" id="position">
                                        <option value="">- Select rank you are applying -</option>
                                        <?php foreach($data as $position):?>
                                        <option value="<?php echo $position['id'];?>"><?php echo $position['title'];?></option>
                                        <?php endforeach;?>
                                    </select>
                                    </div>
                                    <br><br>

                                    <div class="row">
                                    <div class="col-md-6 col-sm-12 col-lg-6">
                                    <strong>UPLOAD YOUR PAPERS</strong>
                                    <!--<label for="input-folder-3 mt-3">UPLOAD YOUR CV</label><br>-->
                                    <strong class="text-danger">Files should be in <strong>pdf/jpg/jpeg</strong> format.
                                    <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                    </strong>
                                    <div class="file-loading">
                                        <input id="input-folder-3" name="input-folder-3" type="file">
                                    </div>
                                    </div>
                                    <div class="col-md-6 col-sm-12 col-lg-6">
                                    <strong>UPLOAD YOUR CV </strong>
                                    <!--<label for="input-folder-4 mt-3">UPLOAD YOUR PAPERS</label><br>-->
                                    <strong class="text-danger">Files should be in <strong>pdf/jpg/jpeg</strong> format.
                                    <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                    </strong>
                                    <div class="file-loading">
                                        <input id="input-folder-4" name="input-folder-4" type="file">
                                    </div>
                                    </div>
                                    </div>
                                    <div class="col-sm-12 col-md-12 col-lg-12">
                                        <button type="submit" class="btn btn-primary btn-block btn-round font-weight-bold h6" name="submit">
                                            Apply <i class="zmdi zmdi-zoomIn"></i></button>
                                    </div>
                                    </form>
                                    
                                </div>
                            </div>
                                <!-- <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal</p>
                                <a href="blog-details.html" title="read more" class="btn btn-round btn-info">Read More</a>                         -->
                            </div>
                        </div>                
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>