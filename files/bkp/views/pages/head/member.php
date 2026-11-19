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

  <div class="row">
    <div class="col s12 m12 l12">
      <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
          <h4 class="card-title">UNIT MEMBERS</h4>
          <div class="row">
            <div class="col s12">
              <p>All Staff Members within various unit(s) connected to the Head.</p>
            </div><br><br>
            <div class="col s12">
              <div>
                <table id="row-group-tbl-member" class="display">
                  <thead>
                    <tr role="row">
                      <th><b>PHOTO</b></th>
                      <th><b>STAFF#</b></th>
                      <th><b>UNIT</b></th>
                      <th><b>NAME</b></th>
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
                          <td>
                            <img src="<?= $row['photo']; ?>" style="height:40px;display:block;margin:0 auto;border-radius:50%" onclick="window.open('<?= $row['photo']; ?>')" />
                            <?php if ($row['apply_procure'] == $row['nox']) : ?>
                              <a href='#' class='waves-effect waves-light chip lighten-5 text-darken-2 green green-text' title="Assigned as Person to make Procurement Request" data-sno="<?= $row['nox'] ?>"><b>Assigned To Make Request
                                </b></a>
                            <?php else : ?>
                              <a href='#' class='waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue btn-small box-shadow-none border-round mr-1 mb-1 right hod_make_procure' title="Assign as Person to make Procurement Request" data-sno="<?= $row['nox'] ?>"><b>Procurement
                                </b></a>
                            <?php endif; ?>

                          </td>
                          <td><strong><?= $row['nox'] ?></strong></td>
                          <td><?= $row['long_name'] ?></td>
                          <td><b><?= $row['fname'] . ' ' . $row['mname'] . ' ' . $row['lname'] ?></b></td>
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