<style>
    #comment {
        border-style: solid;
        border-color: #d5d5d5;
    }

    #comment:hover {
        background-color: #d5d5d5;
    }
</style>
<section class="">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12">
                <h2>Staff Promotion List
                    <hr>
                    <?php
                    // var_dump($data['users'])
                    ?>
                    <!-- <small class="text-muted">Welcome! You can view promotion status here</small> -->
                </h2>
            </div>
            <div class="col-lg-5 col-md-6 col-sm-12">
                <!-- <button class="btn btn-primary btn-icon btn-round hidden-sm-down float-right m-l-10" type="button">
                    <i class="zmdi zmdi-plus"></i>
                </button> -->
                <!-- <ul class="breadcrumb float-md-right"> -->
                <!-- <li class="breadcrumb-item"><a href="pages/promo_apply"><i class="zmdi zmdi-home"></i> Main</a></li> -->
                <!-- <li class="breadcrumb-item"><a href="javascript:void(0);">Staff</a></li>
                    <li class="breadcrumb-item active">All Promotion Application</li>
                </ul> -->
                <!--<button class='btn waves-effect waves-light red darken-4 border-round right  promo_apply' id="promo_apply"  data-sno="<?= $_SESSION['user']['staff_no'] ?>" data-type="1" >
                    <span class="hide-on-small-only">NEW REQUEST</span>
                    <i class="material-icons show-on-small right">note_add</i>
                </button>-->
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <div id="notice">

        </div>
        <div class="row clearfix">
            <div class="col-md-12">
                <div class="card patients-list">
                    <div class="body">
                        <div class="table-responsive">
                            <table class="table m-b-0 table-hover">
                                <thead>
                                    <tr>
                                        <th>Media</th>
                                        <th>Staff ID</th>
                                        <th>Name</th>
                                        <th>Position Applied</th>
                                        <th>Date Applied</th>
                                        <!-- <th>Stage</th> -->
                                        <th>Progress</th>
                                        <th>Status</th>
                                        <th>Documents</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($data as $promo) : ?>
                                        <tr>
                                            <td><span class="list-icon"><img class="patients-img" src="../../public/images/avatar3.png" alt=""></span></td>
                                            <td><span class="text-info"><?php echo $promo['staff_no']; ?></span></td>
                                            <td><?php echo $promo['fname'] . ' ' . $promo['lname']; ?></td>
                                            <td><?php echo $promo['title']; ?></td>
                                            <td><?php echo $promo['activity_date']; ?></td>
                                            <td>
                                                <div class="progress">
                                                    <?php if ($promo['promo_status'] == 1) : ?>
                                                        <div class="progress-bar progress-bar-danger progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="5" aria-valuemin="0" aria-valuemax="100" style="width:5%">
                                                            <span class="sr-only">5% Complete</span>
                                                        </div>
                                                    <?php elseif ($promo['promo_status'] == 2) : ?>
                                                        <div class="progress-bar progress-bar-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width:20%">
                                                            <span class="sr-only">20% Complete</span>
                                                        </div>
                                                    <?php elseif ($promo['promo_status'] == 3) : ?>
                                                        <div class="progress-bar progress-bar-info progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width:40%">
                                                            <span class="sr-only">40% Complete</span>
                                                        </div>
                                                    <?php elseif ($promo['promo_status'] == 4) : ?>
                                                        <div class="progress-bar progress-bar-primary progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width:50%">
                                                            <span class="sr-only">50% Complete</span>
                                                        </div>
                                                    <?php elseif ($promo['promo_status'] == 5) : ?>
                                                        <div class="progress-bar progress-bar-inverse progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style="width:70%">
                                                            <span class="sr-only">70% Complete</span>
                                                        </div>
                                                    <?php elseif ($promo['promo_status'] == 6) : ?>
                                                        <div class="progress-bar progress-bar-warning progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" style="width:90%">
                                                            <span class="sr-only">90% Complete</span>
                                                        </div>
                                                    <?php elseif ($promo['promo_status'] == 7) : ?>
                                                        <div class="progress-bar progress-bar-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">
                                                            <span class="sr-only">100% Complete</span>
                                                        </div>
                                                    <?php endif; ?>
                                                </div>
                                            </td>
                                            <td>
                                                <?php if ($promo['promo_status'] == 1) : ?>
                                                    <a href="#" class="badge badge-info">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Received by HoD';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not qualified contact HoD';
                                                        } elseif ($promo['stage_status'] == 0) {
                                                            echo 'Received by HoD';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'HOD is Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HOD is Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'HOD is Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'HOD is Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'HOD' : 'HOD') . ' Awaiting Application Form Update';
                                                        }
                                                        ?>

                                                    </a>
                                                <?php elseif ($promo['promo_status'] == 2) : ?>
                                                    <a href="#" class="badge badge-warning">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Dean' : 'Approved & forwarded to Director');
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Dean' : 'Not qualified contact Director');
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Application Form Update';
                                                        }
                                                        ?>

                                                    </a>
                                                <?php elseif ($promo['promo_status'] == 3) : ?>
                                                    <a href="#" class="badge badge-danger">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Provost' : 'Approved & forwarded to Registrar');
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Provost' : 'Not qualified contact Registrar');
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned To Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Application Form Update';
                                                        }
                                                        ?>

                                                    </a>
                                                <?php elseif ($promo['promo_status'] == 4) : ?>
                                                    <a href="#" class="badge badge-primary">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Approved & forwarded to HR';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not qualified contact HR';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'HR is Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'HR is Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'HR is Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Both Application Form Update';
                                                        }
                                                        ?>
                                                    </a>
                                                <?php elseif ($promo['promo_status'] == 5) : ?>
                                                    <a href="#" class="badge badge-inverse">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Assigned To Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not qualified contact HR';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'HR is Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'HR is Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'HR is Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Both Application Form Update';
                                                        }
                                                        ?>
                                                    </a>
                                                <?php elseif ($promo['promo_status'] == 6) : ?>
                                                    <a href="#" class="badge badge-warning">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Approved & Promoted by HR';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not qualified contact HR';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'HR is Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'HR is Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'HR is Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Both Application Form Update';
                                                        }
                                                        ?>
                                                    </a>
                                                <?php elseif ($promo['promo_status'] == 7) : ?>
                                                    <a href="#" class="badge badge-success">
                                                        <?php
                                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                                            echo 'Approved & Promoted';
                                                        } elseif ($promo['stage_status'] == 2) {
                                                            echo 'Not Qualified';
                                                        } elseif ($promo['stage_status'] == 3) {
                                                            echo 'Assigned to Assessor(s)';
                                                        } elseif ($promo['stage_status'] == 8) {
                                                            echo 'HR is Awaiting CV Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Application Form Update';
                                                        } elseif ($promo['stage_status'] == 9) {
                                                            echo 'HR is Awaiting Papers Update';
                                                        } elseif ($promo['stage_status'] == 10) {
                                                            echo 'HR is Awaiting Both CV, Application Form & Papers Update';
                                                        } elseif ($promo['stage_status'] == 11) {
                                                            echo 'HR is Awaiting Both Application Form Update';
                                                        }
                                                        ?>
                                                    </a>
                                                <?php endif; ?>
                                            </td>
                                            <td>
                                                <a href="#" onclick="promo_status(<?php echo $promo['promotion_id']; ?>)" class="badge badge-info" title="View & Download Documents">
                                                    <i class="zmdi zmdi-eye" style="font-size:30px"></i>
                                                </a>

                                            </td>
                                            <?php if ($promo['stage_status'] == 10 && $promo['returned'] == 1) : ?>
                                                <td>
                                                    <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Take Action" data-target="#updatedf2" title="Upload Updated Document(s)" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="<?= $promo['promo_status'] . ',' . $promo['stage_status']; ?>">
                                                        <i class="zmdi zmdi-edit"></i>
                                                    </a>
                                                </td>
                                            <?php elseif ($promo['stage_status'] == 8 && $promo['returned'] == 1) : ?>
                                                <td>
                                                    <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Take Action" data-target="#returnonef" title="Upload Updated Document(s)" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="<?= $promo['promo_status'] . ',' . $promo['stage_status']; ?>">
                                                        <i class="zmdi zmdi-edit"></i>
                                                    </a>
                                                </td>
                                            <?php elseif ($promo['stage_status'] == 11 && $promo['returned'] == 1) : ?>
                                                <td>
                                                    <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Take Action" data-target="#returnonef_app" title="Upload Updated Document(s)" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="<?= $promo['promo_status'] . ',' . $promo['stage_status']; ?>">
                                                        <i class="zmdi zmdi-edit"></i>
                                                    </a>
                                                </td>
                                            <?php elseif ($promo['stage_status'] == 9 && $promo['returned'] == 1) : ?>
                                                <td>
                                                    <a href="javascript:void(0);" class="btn btn-primary btn-round" data-toggle="modal" data-original-title="Take Action" data-target="#returnonepp" title="Upload Updated Document(s)" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="<?= $promo['promo_status'] . ',' . $promo['stage_status']; ?>">
                                                        <i class="zmdi zmdi-edit"></i>
                                                    </a>
                                                </td>
                                            <?php endif; ?>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<div class="modal fade right" id="returnonef" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="approval_modalTitle" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div class="modal-content" style="border-radius: 10px 10px;">
            <div class="modal-header bg-primary">
                <h5 class="modal-title text-white">Submit Updated Document (CV)</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                </button>
            </div>
            <div class="modal-body bg-light">
                <form method="POST" class="updatedpffile">
                    <input type="hidden" name="promo_id" id="promo_id">
                    <input type="hidden" name="promo_stage" id="promo_stage">
                    <input type="hidden" name="apply_type" id="apply_type" value='0'>
                    <div class="clearfix">
                        <div class="col-lg-12 col-md-12 mb-4">
                            <div class="form-group">
                                <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type a Comment</strong></label>
                                <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                            </div>
                        </div>
                        <div class="col-lg-12 col-md-12 mb-4">
                            <label for="input-folder-3" class="text-dark font-weight-bold mt-4" style="font-size:15px;"><strong>UPLOAD UPDATED CV</strong></label><br>
                            <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                            <div class="file-loading">
                                <input id="input-folder-3" name="input-folder-3" type="file">
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
                                Submit</button>
                        </div>
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
                                Cancel</button>
                        </div>
                    </div>
            </div>

            </form>
        </div>
    </div>
</div>

<div class="modal fade right" id="returnonef_app" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="approval_modalTitle" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div class="modal-content" style="border-radius: 10px 10px;">
            <div class="modal-header bg-primary">
                <h5 class="modal-title text-white">Submit Updated Document (Application Form)</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                </button>
            </div>
            <div class="modal-body bg-light">
                <form method="POST" class="updatedpffile_app">
                    <input type="hidden" name="promo_id" id="promo_id">
                    <input type="hidden" name="promo_stage" id="promo_stage">
                    <input type="hidden" name="apply_type" id="apply_type" value='0'>
                    <div class="clearfix">
                        <div class="col-lg-12 col-md-12 mb-4">
                            <div class="form-group">
                                <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type a Comment</strong></label>
                                <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                            </div>
                        </div>
                        <div class="col-lg-12 col-md-12 mb-4">
                            <label for="input-folder-3" class="text-dark font-weight-bold mt-4" style="font-size:15px;"><strong>UPLOAD UPDATED APPLICATION FORM</strong></label><br>
                            <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                            <div class="file-loading">
                                <input id="input-folder-5" name="input-folder-3" type="file">
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
                                Submit</button>
                        </div>
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
                                Cancel</button>
                        </div>
                    </div>
            </div>

            </form>
        </div>
    </div>
</div>

<div class="modal fade right" id="returnonepp" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="approval_modalTitle" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div class="modal-content" style="border-radius: 10px 10px;">
            <div class="modal-header bg-primary">
                <h5 class="modal-title text-white">Submit Updated Document (Papers)</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                </button>
            </div>
            <div class="modal-body bg-light">
                <form method="POST" class="updatedpffilepp">
                    <input type="hidden" name="promo_id" id="promo_id">
                    <input type="hidden" name="promo_stage" id="promo_stage">
                    <input type="hidden" name="apply_type" id="apply_type" value='0'>
                    <div class="clearfix">
                        <div class="col-lg-12 col-md-12 mb-4">
                            <div class="form-group">
                                <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type a Comment</strong></label>
                                <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                            </div>
                        </div>
                        <div class="col-lg-12 col-md-12 mb-4">
                            <label for="input-folder-1" class="text-dark font-weight-bold mt-4" style="font-size:15px;"><strong>UPLOAD UPDATED PAPERS</strong></label><br>
                            <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                            <div class="file-loading">
                                <input id="input-folder-1" name="input-folder-3" type="file">
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
                                Submit</button>
                        </div>
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
                                Cancel</button>
                        </div>
                    </div>
            </div>

            </form>
        </div>
    </div>
</div>

<div class="modal fade right" id="updatedf2" tabindex="-1" role="dialog" style="width:50%; height:100%;" aria-labelledby="approval_modalTitle" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
        <div class="modal-content" style="border-radius: 10px 10px;">
            <div class="modal-header bg-primary">
                <h5 class="modal-title text-white">Submit Updated CV, Papers and Application Form</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true" class="text-white btn-sm btn-danger">Close</span>
                </button>
            </div>
            <div class="modal-body bg-light">
                <form method="POST" class="updatedpffile2">
                    <input type="hidden" name="promo_id" id="promo_id">
                    <input type="hidden" name="promo_stage" id="promo_stage">
                    <input type="hidden" name="apply_type" id="apply_type" value='0'>
                    <div class="clearfix">
                        <div class="col-lg-12 col-md-12 mb-4">
                            <div class="form-group">
                                <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type a Comment</strong></label>
                                <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 col-sm-12 col-lg-6">
                                <strong class="text-dark mb-3" style="font-size:15px;">UPLOAD YOUR CV </strong>
                                <!--<label for="input-folder-card3 mt-3">UPLOAD YOUR CV</label><br>-->
                                (<strong class="text-danger"> Files should be in <strong>.pdf</strong> format.
                                    <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                </strong>)
                                <div class="file-loading">
                                    <input id="input-folder-2" name="input-folder-3" type="file">
                                </div>
                            </div>
                            <div class="col-md-6 col-sm-12 col-lg-6">
                                <strong class="text-dark mb-3" style="font-size:15px;">UPLOAD YOUR PAPERS </strong>
                                <!--<label for="input-folder-4 mt-3">UPLOAD YOUR PAPERS</label><br>-->
                                (<strong class="text-danger"> <strong>.pdf</strong> format Only.
                                    <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                                </strong>)
                                <div class="file-loading">
                                    <input id="input-folder-4" name="input-folder-4" type="file">
                                </div>
                            </div>
                            <div class="col-md-6 col-sm-12 col-lg-6">
                                <strong class="text-dark mb-3" style="font-size:15px;">UPLOAD YOUR APPLICATION FORM </strong>
                                (<strong class="text-danger"> <strong>.pdf</strong> format Only.
                                </strong>)
                                <div class="file-loading">
                                    <input id="input-folder-6" name="input-folder-5" type="file">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
                                Submit</button>
                        </div>
                        <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                            <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
                                Cancel</button>
                        </div>
                    </div>
            </div>

            </form>
        </div>
    </div>
</div>