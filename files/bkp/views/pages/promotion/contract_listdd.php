<?php $headtype = isset($_SESSION['headtype']) ? $_SESSION['headtype'] : (isset($_SESSION['user']['type']) ? $_SESSION['user']['type'] : ''); ?>

<?php //var_dump($data['positions']); ?>
<section class="section">
    <!-- Page Header -->
    <div class="row">
        <div class="col s12 m7">
            <h5 class="blue-text text-darken-2">
                All Contract Staff Renewals
            </h5>
            <p class="grey-text">
                Welcome! You can act on contract renewal here
            </p>
        </div>
        <div class="col s12 m5 right-align">
            <nav class="transparent z-depth-0">
                <div class="nav-wrapper">
                    <div class="col s12">
                        <a href="/pages/promo_apply" class="breadcrumb blue-text">Main</a>
                        <a href="javascript:void(0);" class="breadcrumb blue-text"><?php echo(($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director')?></a>
                        <a class="breadcrumb grey-text text-darken-2">
                            Contract Renewal
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    </div>

    <!-- Table Card -->
    <div class="card">
        <div class="card-content">
            <span class="card-title">Applications</span>

            <div class="responsive-table">
                <table id="row-group-tbl-promo" class="display">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Media</th>
                            <th>Staff ID</th>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Date Applied</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <!-- <th class="center-align">Action</th> -->
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach($data['positions_dean'] as $promo): ?>
                        <tr>
                            <td>
                        <?php //echo $promo['stage_status'];?>
                                <a href='javascript:void(0);' data-original-title="View & Download Documents" class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 promo_data' data-sno="<?= $_SESSION['user']['staff_no'] ?>" data-pid="<?= $promo['promotion_id'] . ',' . '0' ?>" title="View & Download Documents">
                                        <i class="fas fa-file me-1"></i></a>
                                 <a href="downloadfile1/<?= $promo['promotion_id'];?>"
                                   class="btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text mr-1 mb-1"
                                   title="CV Download"
                                   data-tooltip="<?= basename($promo['promo_doc1']); ?>">
                                    <i class="material-icons">file_download</i>
                                </a>

                                <a href="downloadfile/<?= $promo['promotion_id'];?>"
                                   class="btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1"
                                   data-tooltip="<?= basename($promo['promo_doc2']); ?>" title="Supporting Documents">
                                    <i class="material-icons">file_download</i>
                                </a>
                                <?php if ($promo['stage_status'] == 2) : ?>
                                    <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 promo_approve' disabled data-original-title="Approve/Disapprove" title="Take Action" data-sno="<?= $promo['staff_no'] ?>" data-id="<?php echo $promo['promotion_id']; ?>"
                                    data-stage_status="<?= $promo['stage_status'] ?>" data-entry="7">
                                        <i class="fas fa-thumbs-up me-1"></i></a>
                                <?php elseif ($promo['stage_status'] == 1 || $promo['stage_status'] == 3) : ?>
                                    <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 promo_approve' <?= (($promo['promo_status'] > 2) ? 'disabled' : '') ?> data-original-title="Approve/Disapprove"
                                        data-stage_status="<?= $promo['stage_status'] ?>" data-sno="<?= $promo['staff_no'] ?>" title="Take Action" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="3,2">
                                        <i class="fas fa-thumbs-up me-1"></i></a>
                                    <!-- <a href='javascript:void(0);' class='btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1 promo_reverse' <?= (($promo['promo_status'] > 1) ? 'disabled' : '') ?> data-sno="<?= $promo['staff_no'] ?>" title="Return form to applicant" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="1">
                                        <i class="fas fa-reply me-1"></i></a> -->
                                <?php elseif ($promo['stage_status'] == 13 || $promo['stage_status'] == 14) : ?>
                                    <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 promo_approve' <?= (($promo['promo_status'] > 3) ? 'disabled' : '') ?> data-original-title="Approve/Disapprove"
                                        data-stage_status="<?= $promo['stage_status'] ?>" data-sno="<?= $promo['staff_no'] ?>" title="Take Action" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="3,2">
                                        <i class="fas fa-thumbs-up me-1"></i></a>
                                    <!-- <a href='javascript:void(0);' class='btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1 promo_reverse' <?= (($promo['promo_status'] > 2) ? 'disabled' : '') ?> data-sno="<?= $promo['staff_no'] ?>" title="Return form to applicant" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="1">
                                        <i class="fas fa-reply me-1"></i></a> -->
                                <?php elseif ($promo['stage_status'] == 0 && $promo['promo_status'] == 1) : ?>
                                    <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 cyan green-text mr-1 mb-1 promo_approve' title="Approve/Disapprove" data-sno="<?= $promo['staff_no'] ?>"
                                    data-stage_status="<?= $promo['stage_status'] ?>" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="3,2">
                                        <i class="fas fa-thumbs-up me-1"></i></a>
                                    <!-- <a href='javascript:void(0);' class='btn waves-effect waves-light chip chip lighten-5 text-darken-2 cyan cyan-text mr-1 mb-1 promo_reverse' data-original-title="Take Action" title="Return form to applicant" data-sno="<?= $promo['staff_no'] ?>" data-id="<?php echo $promo['promotion_id']; ?>" data-entry="1">
                                        <i class="fas fa-reply me-1"></i></a> -->
                                <?php endif; ?>

                            </td>
                            <td>
                                <img src="../../public/images/avatar3.png"
                                     class="circle"
                                     width="40">
                            </td>
                            <td class="blue-text">
                                <?= $promo['staff_no']; ?>
                            </td>
                            <td>
                                <?= $promo['fname'].' '.$promo['lname']; ?>
                            </td>
                            <td><?= $promo['title']; ?></td>
                            <td><?= $promo['activity_date']; ?></td>

                            <!-- STATUS -->
                            <td>
                                <small class="chip lighten-5 text-darken-2 
                                    <?= ($promo['promo_status'] == 1 ? 'green green-text ' : ($promo['promo_status'] == 2 ? 'amber darken-1 black-text' : ($promo['promo_status'] == 3 ? 'purple darken-3 white-text' : ($promo['promo_status'] == 4 ? 'orange darken-1 orange-text' : ($promo['promo_status'] == 5 ? 'brown darken-1 brown-text' : ($promo['promo_status'] == 6 ? 'amber darken-1 dark-grey-text' : ($promo['promo_status'] == 7 ? 'orange darken-1 cyan-text' : 'blue blue-text'))))))); ?>">
                                <b>
                                    <?php if ($promo['promo_status'] == 1) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo 'Awaiting your feedback';
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo 'Disapprove by Head';
                                        } elseif ($promo['stage_status'] == 0) {
                                            echo 'Awaiting your feedback';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo 'Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo 'Awaiting Application Form Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo 'Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD and applicant';
                                        }
                                        ?>

                                    <?php elseif ($promo['promo_status'] == 2) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Awaiting your feedback' : 'Awaiting your feedback');
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Dean' : 'Not qualified contact Director');
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD';  
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Application Form Update';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD and applicant';
                                        }
                                        ?>
                                    <?php elseif ($promo['promo_status'] == 3) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo (($headtype == 'ACADEMIC') ? 'Approved & forwarded to Provost' : 'Approved & forwarded to Registrar');
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo (($headtype == 'ACADEMIC') ? 'Not qualified, Provost disapproved' : 'Not qualified, Registrar disapproved');
                                        } elseif ($promo['stage_status'] == 3) {
                                            echo 'Assigned To Assessor(s)';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . 'Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . 'Awaiting Application Form Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . 'Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . 'Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' to HOD';  
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Application Form Update';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' to HOD and applicant';
                                        }
                                        ?>
                                    <?php elseif ($promo['promo_status'] == 4) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo 'Approved & forwarded to HR';
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo 'Not qualified, HR disapproved';
                                        } elseif ($promo['stage_status'] == 3) {
                                            echo 'Assigned to Assessor(s)';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo 'Assigned to Assessor(s)';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo 'Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo 'Awaiting Application Form Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo 'Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'HR' : 'HR') . ' to HOD';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'HR' : 'HR') . ' to HOD and applicant';
                                        }
                                        ?>
                                    <?php elseif ($promo['promo_status'] == 5) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo 'Assigned To Assessor(s)';
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo 'Not qualified, HR disapproved';
                                        } elseif ($promo['stage_status'] == 3) {
                                            echo 'Assigned to Assessor(s)';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo 'Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo 'Awaiting Application Form Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo 'Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD and applicant';
                                        }
                                        ?>
                                    <?php elseif ($promo['promo_status'] == 6) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo 'Approved & forwarded to HR';
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo 'Not qualified, HR disapproved';
                                        } elseif ($promo['stage_status'] == 3) {
                                            echo 'Assigned to Assessor(s)';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo 'Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo 'Awaiting Application Form Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo 'Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD and applicant';
                                        }
                                        ?>
                                    <?php elseif ($promo['promo_status'] == 7) : ?>
                                        <?php
                                        if ($promo['stage_status'] == 1 || $promo['stage_status'] == 0) {
                                            echo 'Approved & Promoted';
                                        } elseif ($promo['stage_status'] == 2) {
                                            echo 'Not Qualified';
                                        } elseif ($promo['stage_status'] == 3) {
                                            echo 'Assigned to Assessor(s)';
                                        } elseif ($promo['stage_status'] == 8) {
                                            echo 'Awaiting CV Update';
                                        } elseif ($promo['stage_status'] == 11) {
                                            echo 'Awaiting Application Form Update';
                                        } elseif ($promo['stage_status'] == 9) {
                                            echo 'Awaiting Papers Update';
                                        } elseif ($promo['stage_status'] == 10) {
                                            echo 'Awaiting Both CV, Application Form & Papers Update';
                                        }elseif ($promo['stage_status'] == 13) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD';
                                        }elseif ($promo['stage_status'] == 14) {
                                            echo 'Reversed from ' . (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' to HOD and applicant';
                                        }
                                        ?>
                                        </a>
                                    <?php endif; ?>
                                </b></small>
                            </td>

                            <!-- DOCUMENTS -->
                            <td>
                               <?php
                                    $progress = [1=>5,2=>20,3=>40,4=>50,5=>70,6=>90,7=>100];
                                    $percent = $progress[$promo['promo_status']] ?? 0;
                                ?>
                                <div class="progress grey lighten-3">
                                    <div class="determinate blue"
                                            style="width: <?php echo $percent; ?>%">
                                    </div>
                                </div>
                                <small><?php echo $percent; ?>%</small>
                                
                            </td>

                            <!-- ACTION -->
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>


<!-- <div class="modal fade right" id="approve" tabindex="-1" role="dialog" aria-labelledby="approval_modalTitle" style="width:500px; height:auto;" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable" role="document">
    <div class="modal-content" style="border-radius: 10px 10px;">
      <div class="modal-header bg-primary">
        <h5 class="modal-title text-white">Approve/Disapprove</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body bg-light">
    <form method="POST" class="uploadfileapproval">
        <input type="hidden" name="promo_id" id="promo_id">
        <input type="hidden" name="promo_stage" id="promo_stage">
        <input type="hidden" name="apply_type" id="apply_type" value='1'>
        <div class="clearfix">
        <div class="funkyradio row">
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio1" value="1" />
                <label for="radio1">Approve</label>
            </div>
            <div class="funkyradio-primary col-md-6 col-lg-6 col-sm-6">
                <input type="radio" name="radio" class="radio" id="radio2" value="2"/>
                <label for="radio2">Disapprove</label>
            </div>
        </div>
            <div class="col-lg-12 col-md-12">
                <div class="form-group">
                    <label for="comment">Comments</label>
                    <textarea name="comment" id="comment" rows="2" class="form-control" placeholder="Type a comment here..."></textarea>
                </div>
            </div>
            <div class="col-lg-12 col-md-12 mb-4">
                <label for="input-folder-3 mt-3"><strong>Upload Commitees Report</strong></label><br>
                <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                <div class="file-loading">
                    <input id="input-folder-3" name="input-folder-3[]" type="file">
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
</div> -->

<!-- <script>
    $("#approve").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        var promo_id = button.data('id');
        var promo_stage = button.data('entry');

        var modal = $(this);
        modal.find('.modal-body #promo_id').val(promo_id);
        modal.find('.modal-body #promo_stage').val(promo_stage);
    })
</script> -->