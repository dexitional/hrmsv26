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
                    <h4 class="card-title">UNIT LEAVE INFORMATION</h4>
                    <div class="row">
                        <div class="col s12">
                            <p>All Staff Members within various unit(s) connected to the Head.</p>
                        </div><br><br>
                        <div class="col s12">
                            <div class="table-responsive">
                                <table id="row-group-tbl-leave">
                                    <thead>
                                        <tr role="row">
                                            <th><b>PHOTO</b></th>
                                            <th><b>STAFF#</b></th>
                                            <th><b>UNIT</b></th>
                                            <th><b>NAME</b></th>
                                            <th><b>CONTACT</b></th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        if (count($data) > 0) {
                                            foreach ($data as $row) {
                                        ?>
                                                <tr>
                                                    <td>
                                                        <?php if ($row['onleave'] && ($row['status'] == 'HEAD-PENDING' && $row['inyear'] == date('Y')) && $row['lid'] != 0) { ?>
                                                            <a href='#' class='waves-effect waves-light btn amber darken-1 black-text font-weight-bold btn-small box-shadow-none border-round mb-1 approve_leave right' data-lid="<?= $row['lid'] ?>"><b>APPROVE
                                                                    <small><em>(<?= $row['nox'] ?>)</em></small></b></a>
                                                            <a href='leaveformrep/<?= $row['lid']; ?>' target="_blank" class='waves-effect waves-light btn gradient-45deg-indigo-blue font-weight-bold btn-small box-shadow-none border-round right mb-2' title="LEAVE FORM OF <?= $row['fname'] . ' ' . $row['mname'] . ' ' . $row['lname'] ?>"><i class="material-icons">article</i> <b></b></a>
                                                        <?php } elseif ($row['onleave'] && $row['flag_leave'] == '2') {  ?>
                                                            <a href='#' class='waves-effect waves-light btn btn-small box-shadow-none border-round mr-1 mb-1 right amber darken-1 black-text'><i class="material-icons">article</i> <b>RELIEVER</b></a>
                                                        <?php } elseif ($row['onleave'] && $row['status'] != 'HEAD-PENDING' && $row['lid'] != 0) {  ?>
                                                            <a href='leaveformrep/<?= $row['lid']; ?>' target='_blank' class='waves-effect waves-light btn btn-small box-shadow-none border-round mr-1 mb-1 right <?= $row['status'] == 'GRANTED' ? 'gradient-45deg-green-teal' : 'amber darken-1 black-text'; ?>'><b>
                                                                    <?= $row['status'] == 'GRANTED' ? 'ON-LEAVE <small><em>(' . $row['nox'] . ')</em></small>' : $row['status'] . '<small><em>(' . $row['nox'] . ')</em></small>' ?></b></a>
                                                        <?php } else {  ?>
                                                            <a href='#' class='waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue btn-small box-shadow-none border-round mr-1 mb-1 right hod_apply_leave' data-sno="<?= $row['nox'] ?>"><b>APPLY
                                                                    <small><em>(<?= $row['nox'] ?>)</em></small></b></a>
                                                        <?php } ?>
                                                    </td>
                                                    <td>
                                                        <img src="<?= $row['photo'] ?>" style="height:40px;display:block;margin:0 auto;border-radius:50%" onclick="window.open('<?= $row['photo'] ?>')" />
                                                        <center><b><?= $row['nox'] ?></b></center>
                                                    </td>
                                                    <td><?= $row['long_name'] ?></td>
                                                    <td>
                                                        <b><?= $row['fname'] . ' ' . $row['mname'] . ' ' . $row['lname'] ?></b><br>
                                                        <small style="font-size:11px"><em><b class="light-blue-text text-darken-3"><?= $row['jobtitle'] ?></b></em></small>
                                                    </td>
                                                    <td>
                                                        <b><?= $row['phone'] ?></b><br>
                                                        <small style="font-size:11px"><em><b class="light-blue-text text-darken-3"><?= $row['ucc_mail'] ?></b></em></small>
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