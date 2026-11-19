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
<?php //var_dump($_SESSION['advisers']);
?>
<div class="section section-data-tables">

  <div class="row">
    <div class="col s12 m12 l12">
      <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
          <h4 class="card-title">ALL ACADEMIC STAFF</h4>
          <div class="row">
            <div class="col s12">
              <p>All Academic Staff within various unit(s) connected.</p>
            </div><br><br>
            <div class="col s12">
              <div class="responsive-table">
                <!-- <table class="table invoice-data-table white border-radius-4 pt-1"> -->
                <!-- <table class="table table-striped table-hover table-border table-sm"> -->
                <table id="row-group-tbl-adviser-approve" class="display">
                  <thead>
                    <tr role="row">
                      <th><b>NAME</b></th>
                      <th><b>PHOTO</b></th>
                      <th><b>STAFF#</b></th>
                      <th><b>STATUS</b></th>
                      <th><b>UNIT</b></th>
                      <th><b>CONTACT</b></th>
                      <th><b>DESIGNATION</b></th>

                    </tr>
                  </thead>
                  <tbody>
                    <?php
                    if (count($data) > 0) {
                      foreach ($data as $row) {
                    ?>
                        <tr>
                        <td><b><?= $row['fname'] . ' ' . $row['mname'] . ' ' . $row['lname'] ?></b>
                            <div class="row">
                              <a href='#' class='btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text vc_make_advicer' title="Act on Adviser" data-sno="<?= $row['nox'] ?>"><b><i class="material-icons">edit</i>
                                </b>
                              </a>
                                <?php if($row['status'] == 2):?>
                              <a onclick="Popup=window.open('printpage_new_adviser/<?= $row['nox']?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" title="Print Appointment Letter" 
                              class="btn waves-effect waves-light chip lighten-5 text-darken-4 red red-text" href="javascript(void)">
                                  <b><i class="material-icons">print</i></b>
                              </a>
                                  <?php endif; ?>
                            </div>
                          </td>
                          <td>
                          <img src="<?= $row['photo']; ?>" style="height:40px;display:block;margin:0 auto;border-radius:50%" onclick="window.open('<?= $row['photo']; ?>')"/>
                            <!-- <a href='#' class='waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue btn-small box-shadow-none border-round mr-1 mb-1 right vc_make_advicer' title="Act on Adviser" data-sno="<?= $row['nox'] ?>"><b><i class="material-icons">edit</i>
                              </b></a>
                              <a href='#' class='waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue btn-small box-shadow-none border-round mr-1 mb-1 right vc_make_advicer' title="Act on Adviser" data-sno="<?= $row['nox'] ?>"><b><i class="material-icons">edit</i>
                              </b></a> -->

                            
                            
                          </td>
                          <td><strong><?= $row['nox'] ?></strong></td>
                          
                          <td><strong>
                              <?php if (!empty($row['level_ass'])) : ?>
                                <?php if($row['status'] == 2):?>
                                <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 green green-text' data-sno="<?= $row['nox'] ?>">
                                  <b>APPOINTED
                                  </b></a>
                                  <?php else: ?>
                                    <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 blue blue-text' data-sno="<?= $row['nox'] ?>">
                                  <b>NOMINATED
                                  </b></a>
                                  <?php endif; ?>
                                <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 green green-text' data-sno="<?= $row['nox'] ?>">
                                  <b><small>
                                      <?= 'Level: ' . $row['level_ass'] . ' Programme: ' . strtoupper($row['class_name']) ?></small>
                                  </b></a>
                              <?php else : ?>
                                <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 red red-text' data-sno="<?= $row['nox'] ?>">
                                  <b><?php echo 'NOT APPROVED'; ?>
                                  </b></a>
                              <?php endif; ?>

                            </strong></td>
                          <td><?= $row['long_name'] ?></td>
                          <td><b><?= $row['phone'] ?><br><small><em class="light-blue-text text-darken-3"><?= $row['ucc_mail'] ?></em></small></b></td>
                          <td><b><?= $row['jobtitle'] ?></b></td>

                        </tr>
                    <?php }
                    } ?>

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>