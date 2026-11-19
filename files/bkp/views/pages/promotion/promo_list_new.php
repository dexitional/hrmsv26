<style>
  .card .card-content {
    padding: 24px;
    overflow: scroll;
  }

  .action-filters {
    -webkit-box-flex: .95;
    -webkit-flex-grow: .95;
    -ms-flex-positive: .95;
    flex-grow: .95;
  }

  #main .section-data-tables .dataTables_wrapper .dataTables_filter,
  #main .section-data-tables .dataTables_wrapper .dataTables_length {
    display: block;
    width: 100%;
    padding-right: 30px;
    border-bottom: 2px dashed #ccc;
  }

  .dataTables_filter label input[type=search] {
    height: 3.2rem;
    margin: 0 0 15px;
    padding-left: 1.5rem;
    border: 1px solid #9e9e9e !important;
    border-bottom: none;
    border-radius: 150px;
    background: #f1f2f3;
  }

  .dataTables_filter label {
    position: relative;

  }

  .dataTables_filter label:after {
    content: '';
  }
</style>

<div class="section section-data-tables">
  <div id="button-trigger2" class="card card card-default scrollspy">
    <div class="card-content">
      <?php
      // var_dump($_SESSION['user']);

      // var_dump($data['users'])
      ?>

      <h5 class="card-title light-blue-text text-darken-4 mt-5 text-uppercase">Staff Promotion List</h5>
      <marquee behavior="left" direction=""><h5>For enquires call or whatsapp: 0203556742 </h5></marquee>
      <?php if (isset($_SESSION['slim.flash']['error'])) { ?>
        <div class="card-alert card red lighten-5 center border-round" id="msg">
          <div class="card-content red-text">
            <small><b><?= strtoupper($_SESSION['slim.flash']['error']); ?></b></small>
          </div>
          <button type="button" class="close red-text" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
      <?php } ?>
      <?php if (isset($_SESSION['slim.flash']['success'])) { ?>
        <div class="card-alert card green blue-text lighten-5 center border-round" id="msg">
          <div class="card-content red-text">
            <small><b><?= strtoupper($_SESSION['slim.flash']['success']); ?></b></small>
          </div>
          <button type="button" class="close red-text" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
      <?php } ?>
      <div class="clear"></div>

      <div class="responsive-table">

        <table id="row-group-tbl-promo" class="display">
          <thead>
            <tr role="row">
              <th>DOCUMENT</th>
              <th>POSITION</th>
              <th>DATE APPLIED</th>
              <th>STATUS</th>
              <th>NAME</th>
              <th>STAFF No.</th>
            </tr>
          </thead>
          <tbody>
            <?php
            if (count($data) > 0) {
              foreach ($data as $row) {
            ?>
                <tr>
                  <td>
                    <a href='javascript:void(0);' data-original-title="View & Download Documents" class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 promo_data' data-sno="<?= $_SESSION['user']['staff_no'] ?>" data-pid="<?= $row['promotion_id'] . ',' . '0' ?>" title="View & Download Documents">
                      <i class="fas fa-file me-1"></i></a>
                    <?php if (!empty($promo['pd_id'])) { ?>
                      <a onclick="Popup=window.open('printpage_new/<?= $promo['promotion_id'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" class="btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text mr-1 mb-1" href="javascript(void)">
                        <i class="fas fa-edit"></i>
                      </a>
                    <?php } ?>
                    <?php if ($row['stage_status'] >= 8 && $row['returned'] == 1) : ?>
                      <!-- <a href='/promo_apply_sm' class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1' data-target="#returnonepp" title="Upload Updated Document(s)" data-id="<?php echo $row['promotion_id']; ?>" data-entry="<?= $row['promo_status'] . ',' . $row['stage_status']; ?>">
                        <i class="fas fa-reply me-1"></i></a> -->
                      <a href='javascript:void(0);' class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text mr-1 mb-1 promo_update_data' title="Upload Updated Document(s)" data-sno="<?= $_SESSION['user']['staff_no'] ?>" data-id="<?php echo $row['promotion_id']; ?>" data-entry="<?= $row['promo_status'] . ',' . $row['stage_status']; ?>">
                        <i class="fas fa-reply me-1"></i></a>
                    <?php endif; ?>
                  </td>
                  <td>
                    <b class="light-blue-text text-darken-4"><?= $row['title']; ?></b>
                  </td>
                  <td>
                    <b class="light-black-text text-darken-4"><?= $row['activity_date']; ?></b>
                  </td>
                  <td><small class="chip lighten-5 text-darken-2 
                    <?= ($row['promo_status'] == 1 ? 'green green-text ' : ($row['promo_status'] == 2 ? 'amber amber-text' : ($row['promo_status'] == 3 ? 'purple purple-text' : ($row['promo_status'] == 4 ? 'orange orange-text' : ($row['promo_status'] == 5 ? 'brown brown-text' : ($row['promo_status'] == 6 ? 'amber dark-grey-text' : ($row['promo_status'] == 7 ? 'orange orange-text' : 'blue blue-text'))))))); ?>">
                      <b><?php if ($row['promo_status'] == 1) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo 'Received by HoD';
                            } elseif ($row['stage_status'] == 2) {
                              echo 'Not qualified contact HoD';
                            } elseif ($row['stage_status'] == 0) {
                              echo 'Received by HoD';
                            } elseif ($row['stage_status'] == 8) {
                              echo 'HOD is Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo 'HOD is Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HOD is Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 11) {
                              echo 'HOD is Awaiting Application Form Update';
                            }elseif ($row['stage_status'] == 14) {
                                echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean to HOD' : 'Director to HOD') . ' and applicant';
                            }elseif ($row['stage_status'] == 13) {
                                echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean to HOD' : 'Director to HOD') . '';
                            }
                          ?>

                        <?php elseif ($row['promo_status'] == 2) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Dean' : 'Approved & forwarded to Director');
                            } elseif ($row['stage_status'] == 2) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Dean' : 'Not qualified contact Director');
                            } elseif ($row['stage_status'] == 8) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 11) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Dean' : 'Director') . ' Awaiting Application Form Update';
                            }elseif ($row['stage_status'] == 14) {
                                echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost to Dean' : 'Registrar to Director') . ' and applicant';
                            }elseif ($row['stage_status'] == 13) {
                                echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost to Dean' : 'Registrar to Director');
                            }
                          ?>

                        <?php elseif ($row['promo_status'] == 3) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Approved & forwarded to Provost' : 'Approved & forwarded to Registrar');
                            } elseif ($row['stage_status'] == 2) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Not qualified contact Provost' : 'Not qualified contact Registrar');
                            } elseif ($row['stage_status'] == 3) {
                              echo 'Assigned To Assessor(s)';
                            } elseif ($row['stage_status'] == 8) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 11) {
                              echo (($_SESSION['user']['type'] == 'ACADEMIC') ? 'Provost' : 'Registrar') . ' Awaiting Application Form Update';
                            }elseif ($row['stage_status'] == 14) {
                                echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'HR to Provost' : 'HR to Registrar') . ' and applicant';
                            }elseif ($row['stage_status'] == 13) {
                                echo 'Reversed from '. (($_SESSION['user']['type'] == 'ACADEMIC') ? 'HR to Provost' : 'HR to Registrar');
                            }
                          ?>

                        <?php elseif ($row['promo_status'] == 4) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo 'Approved & forwarded to HR';
                            } elseif ($row['stage_status'] == 2) {
                              echo 'Not qualified contact HR';
                            } elseif ($row['stage_status'] == 3) {
                              echo 'Assigned to Assessor(s)';
                            } elseif ($row['stage_status'] == 8) {
                              echo 'HR is Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo 'HR is Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HR is Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 11) {
                              echo 'HR is Awaiting Application Form Update';
                            }
                          ?>
                        <?php elseif ($row['promo_status'] == 5) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo 'Assigned To Assessor(s)';
                            } elseif ($row['stage_status'] == 2) {
                              echo 'Not qualified contact HR';
                            } elseif ($row['stage_status'] == 3) {
                              echo 'Assigned to Assessor(s)';
                            } elseif ($row['stage_status'] == 8) {
                              echo 'HR is Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo 'HR is Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HR is Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HR is Awaiting Application Form Update';
                            }
                          ?>
                        <?php elseif ($row['promo_status'] == 6) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo 'Approved & Promoted by HR';
                            } elseif ($row['stage_status'] == 2) {
                              echo 'Not qualified contact HR';
                            } elseif ($row['stage_status'] == 3) {
                              echo 'Assigned to Assessor(s)';
                            } elseif ($row['stage_status'] == 8) {
                              echo 'HR is Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo 'HR is Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HR is Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 11) {
                              echo 'HR is Awaiting Application Form Update';
                            }
                          ?>
                        <?php elseif ($row['promo_status'] == 7) : ?>
                          <?php
                            if ($row['stage_status'] == 1 || $row['stage_status'] == 0) {
                              echo 'Approved & Promoted';
                            } elseif ($row['stage_status'] == 2) {
                              echo 'Not Qualified';
                            } elseif ($row['stage_status'] == 3) {
                              echo 'Assigned to Assessor(s)';
                            } elseif ($row['stage_status'] == 8) {
                              echo 'HR is Awaiting CV Update';
                            } elseif ($row['stage_status'] == 9) {
                              echo 'HR is Awaiting Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HR is Awaiting  CV, Application Form & Papers Update';
                            } elseif ($row['stage_status'] == 10) {
                              echo 'HR is Awaiting Application Form Update';
                            }
                          ?>
                        <?php endif; ?>
                      </b></small>
                  </td>
                  <td><small><b><?php echo $row['fname'] . ' ' . $row['lname']; ?></b></small></td>
                  <td>
                    <span class="bullet cyan"></span>
                    <span><b><?php echo $row['staff_no']; ?></b> </span>
                  </td>
                </tr>
            <?php
              }
            }
            ?>

          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>