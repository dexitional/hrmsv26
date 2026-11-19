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
<?php //var_dump($ass_data[0]['staff_no']);
?>
<div class="section section-data-tables">
  <div class="row">
    <div class="col s12 m12 l12">
      <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
          <h4 class="card-title">LIST OF STUDENTS 
            <p class="float-right">
              <a onclick="Popup=window.open('printpage_new_adviser/<?= $ass_data[0]['staff_no']?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" title="Print Appointment Letter" style="width: 100px;" class="btn waves-effect waves-light chip lighten-5 text-darken-4 red red-text mr-1 mb-1" href="javascript(void)">
                  <b><i class="material-icons" style="font-size: 30px;">print</i></b>
              </a>
            </p>
          </h4>
          
          <div class="row">
            <div class="col s12">
              <p>All Students assigned to you. <br> <b>PROGRAM ASSIGNED :</b> <?= $data[0]['Programme'] ?> <br> <b>LEVEL :</b> <?= $ass_data[0]['level_ass'] ?></p>
            </div><br><br>
            <div class="col s12">
              <div class="responsive-table">
                <!-- <table class="table invoice-data-table white border-radius-4 pt-1"> -->
                <!-- <table class="table table-striped table-hover table-border table-sm"> -->
                <table id="row-group-tbl-stud" class="display">
                  <thead>
                    <tr role="row">
                      <th><b>ACTION</b></th>
                      <th><b>STATUS</b></th>
                      <th><b>REG. #</b></th>
                      <th><b>NAME</b></th>
                      <th><b>CONTACT</b></th>
                      <th><b>CGPA</b></th>

                    </tr>
                  </thead>
                  <tbody>
                    <?php
                    if (count($data) > 0) {
                      foreach ($data as $row) {
                    ?>
                        <tr>
                          <td>
                            <!-- <img src="<?php //echo $row['photo']; 
                                            ?>" style="height:40px;display:block;margin:0 auto;border-radius:50%" onclick="window.open('<?php //echo $row['photo']; 
                                                                                                                                        ?>')"/> -->
                            <a href='#' class='waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue btn-small box-shadow-none border-round mr-1 mb-1 right adviser_chat' data-studid="<?= $row['studid'] ?>"><b> FEEDBACK
                              </b></a>
                          </td>
                          <td><strong>
                              <?php //echo $row['state'];
                              if (!empty($row['state'])) : ?>
                                <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 green green-text'>
                                  <b><?php echo 'Started Chat'; ?>
                                  </b></a>
                              <?php else : ?>
                                <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 blue blue-text'>
                                  <b><?php echo 'No Chat Activity'; ?>
                                  </b></a>
                              <?php endif; ?>
                            </strong>
                          </td>

                          <td><strong><?= $row['Regno'] ?></strong></td>
                          <!-- <td><?= $row['Programme'] ?></td> -->
                          <td><b><?= $row['Name']; ?></b></td>
                          <td><b><?= $row['cellphone']; ?><br><small><em class="light-blue-text text-darken-3"><?= $row['inst_email'] ?></em></small></b></td>
                          <td>
                          <a onclick="Popup=window.open('/stud_grade.php?regno=<?= $row['Regno'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;" class="btn waves-effect waves-light chip lighten-5 text-darken-4 blue blue-text mr-1 mb-1" href="javascript(void)">
                          <b><?= $row['CGPA'] ?></b>
                      </a>
                            <!-- <a href='https://staffportal.ucc.edu.gh/stud_grade.php?regno=<?= $row['Regno'] ?>' title="View Transcript" class='waves-effect waves-light lighten-5 text-darken-2 blue-text'>
                              <b><?= $row['CGPA'] ?></b>
                            </a> -->
                          </td>

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