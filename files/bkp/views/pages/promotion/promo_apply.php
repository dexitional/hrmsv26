<?php //var_dump($_SESSION['user']); ?>
<style>
#position {
    border-style: solid;
    border-color: #d5d5d5;
}

#position:hover {
    background-color: #d5d5d5;
}

#comment {
    border-style: solid;
    border-color: #d5d5d5;
}

#comment:hover {
    background-color: #d5d5d5;
}
</style>
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 bg-light">
                <h5 class="light-blue-text text-darken-4 mt-5">Apply for Promotion</h5>
                <hr>
                <!-- <h2>Apply for Promotion
                <small class="text-muted">Apply for promotion here</small>
                </h2> -->
            </div>
            <!-- <div class="col-lg-5 col-md-6 col-sm-12">                 -->
            <!-- <button class="btn btn-primary btn-icon btn-round hidden-sm-down float-right m-l-10" type="button">
                    <i class="zmdi zmdi-plus"></i>
                </button> -->
            <!-- <ul class="breadcrumb float-md-right"> -->
            <!-- <li class="breadcrumb-item"><a href="<?php //echo URLROOT; ?>/pages/index"><i class="zmdi zmdi-home"></i> Main</a></li> -->
            <!-- <li class="breadcrumb-item"><a href=""><i class="zmdi zmdi-home"></i> Main</a></li>
                    <li class="breadcrumb-item"><a href="javascript:void(0);">Staff</a></li>
                    <li class="breadcrumb-item active">Apply for Promotion</li>
                </ul>                
            </div> -->
        </div>
    </div>
    <div class="container-fluid">
        <div class="row clearfix">
            <!--<div class="col-lg-4 col-md-12">
                <div class="card">
                    <div class="body">
                        <div class="card bg-light">
                            <div class="header">
                                <h5><strong>About</strong> You</h5>
                            </div>
                            <div class="body">
                                <strong>Name</strong>
                                <p><?php echo $_SESSION['user']['title'].' '.$_SESSION['user']['fname'].' '.$_SESSION['user']['mname'].' '.$_SESSION['user']['lname']; ?></p>
                                <strong>Current Position</strong>
                                <p><?php echo $_SESSION['user']['jobtitle']; ?></p>
                                <strong>Email ID</strong>
                                <p><?php echo $_SESSION['user']['ucc_mail']; ?></p>
                                <strong>Phone</strong>
                                <p><?php echo $_SESSION['user']['phone']; ?></p>
                                <hr>
                                <strong>Current Appointment</strong>
                                <p><?php echo $_SESSION['user']['privilege']; ?></p>
                                <strong>Current Department</strong>
                                <address><?php echo $_SESSION['user']['long_name']; ?></address>
                                <strong>Appointment Date</strong>
                                <p><?php echo $_SESSION['user']['appoint_date'];?></p>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>-->
            <div class="col-lg-12 col-sm-12 col-md-12 card bg-light">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="card">
                            <div class="body text-white">
                                <div class="img-post m-b-15">
                                    <div class="col-lg-12 col-md-12 col-sm-12">
                                        <!-- <form action="<?php //echo URLROOT; ?>/users/send_promo" id="frmFileUpload" method="post"> -->
                                        <form id="frmFileUpload" method="post">
                                            <!--<form action="send_promo" method="post" enctype="multipart/form-data">-->
                                            <input type="hidden" name="apply_type" id="apply_type" value='0'>
                                            <div class="mb-3">
                                                <strong class="text-dark" style="font-size:15px;">JOB RANK : </strong>
                                                <select class="d-block" style="width:100%;" name="position"
                                                    id="position">
                                                    <option value="">------ Select the Rank you are applying for ------
                                                    </option>
                                                    <?php foreach($data as $position):?>
                                                    <option value="<?php echo $position['id'];?>">
                                                        <?php echo $position['title'];?></option>
                                                    <?php endforeach;?>
                                                </select>
                                            </div>
                                            <br><br>
                                            <div class="mb-4">
                                                <div class="form-group">
                                                    <label for="comment" class="text-dark font-weight-bold"
                                                        style="font-size:15px;"><strong>Type of
                                                            Promotion</strong></label>
                                                    <select class="d-block" style="width:100%;" name="comment"
                                                        id="comment">
                                                        <option value="">--- Select Type of
                                                            Promotion
                                                            ---
                                                        </option>
                                                        <option value="REGULAR PROMOTION">REGULAR PROMOTION</option>
                                                        <option value="ACCELERATED PROMOTION">ACCELERATED PROMOTION
                                                        </option>
                                                        <option value="EXCEPTIONAL PROMOTION">EXCEPTIONAL PROMOTION
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                            <br><br>
                                            <?php if($_SESSION['user']['staff_type'] == 'ACADEMIC'){ ?>
                                            <a href="https://www.ucc.edu.gh/file/714/download?token=yX-j77Ij"
                                                class="text-danger" style="font-size:30px" target="_blank">
                                                <i class="zmdi zmdi-download" style="font-size:30px"></i>
                                                DOWNLOAD PROMOTION FORM TO FILL AND UPLOAD</a>
                                            <br><br>
                                            <?php }else{ ?>
                                            <a href="https://www.ucc.edu.gh/file/1618/download?token=0NcbhxZU"
                                                class="text-danger" style="font-size:30px" target="_blank">
                                                <i class="zmdi zmdi-download" style="font-size:30px"></i>
                                                DOWNLOAD PROMOTION FORM TO FILL AND UPLOAD</a>
                                            <br><br>
                                            <?php } ?>
                                            <a href="https://www.ilovepdf.com/compress_pdf"
                                                class="text-danger animated zoomIn infinite" target="_blank"
                                                style="font-size:15px">
                                                CLICK HERE TO REDUCE THE SIZE OF YOUR PAPERS/PUBLICATION BEFORE YOU
                                                UPLOAD</a><br><br>
                                            <div class="row">
                                                <div class="col-md-6 col-sm-12 col-lg-6">
                                                    <strong class="text-dark mb-3" style="font-size:15px;">UPLOAD THE
                                                        PROMOTION FORM </strong>
                                                    <!--<label for="input-folder-4 mt-3">UPLOAD YOUR PAPERS</label><br>-->
                                                    (<strong class="text-danger"> Files should be in
                                                        <strong>.pdf</strong> format and the size less than 2mb. .
                                                        <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                                    </strong>)
                                                    <div class="file-loading">
                                                        <input id="input-folder-1" name="input-folder-1" type="file">
                                                    </div>
                                                </div>
                                                <div class="col-md-6 col-sm-12 col-lg-6">
                                                    <strong class="text-dark mb-3" style="font-size:15px;">UPLOAD YOUR
                                                        CV </strong>
                                                    <!--<label for="input-folder-card3 mt-3">UPLOAD YOUR CV</label><br>-->
                                                    (<strong class="text-danger"> Files should be in
                                                        <strong>.pdf</strong> format and the size less than 2mb.
                                                        <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                                    </strong>)
                                                    <div class="file-loading">
                                                        <input id="input-folder-3" name="input-folder-3" type="file">
                                                    </div>
                                                </div>
                                                <div class="col-md-6 col-sm-12 col-lg-6">
                                                    <strong class="text-dark mb-3" style="font-size:15px;">UPLOAD YOUR
                                                        PAPERS </strong>
                                                    <!--<label for="input-folder-4 mt-3">UPLOAD YOUR PAPERS</label><br>-->
                                                    (<strong class="text-danger"> Files should be in
                                                        <strong>.pdf</strong> format and the size less than 6mb.
                                                        <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                                    </strong>)
                                                    <div class="file-loading">
                                                        <input id="input-folder-4" name="input-folder-4" type="file">
                                                    </div>
                                                </div>
                                            </div>


                                            <!-- <label for="input-folder-3 mt-3">Select files</label><br>
                                    <div class="custom-file mb-3">
                                    <input type="file" class="custom-file-input" id="input-folder-3" name="input-folder-3[]" multiple>
                                    <label class="custom-file-label" for="customFile">Select multiple files</label>
                                    </div> -->
                                            <div class="col-sm-12 col-md-12 col-lg-12">
                                                <button type="submit"
                                                    class="btn btn-primary btn-block btn-round font-weight-bold h6"
                                                    name="submit">
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