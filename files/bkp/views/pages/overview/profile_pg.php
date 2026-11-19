<link href="http://www.allfont.de/allfont.css?fonts=arial-narrow" rel="stylesheet" type="text/css" />
<style type="text/css">
    body {
        background-color: #eee;
    }

    .cover {
        width: 920px;
        margin: 10px auto;
        box-shadow: 2px 2px 4px #999;
        padding: 20px 35px;
        background: #fff;
    }

    .title {
        text-align: center;
        font-size: 34px;
        color: rgb(8, 8, 148);
    }

    .subtitle {
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        font-weight: bolder;
        text-align: center;
        font-size: 25px;
        word-spacing: 0.5em;
        color: red;
        font-style: italic;
        margin-top: -15px;
    }

    .subnote {
        position: relative;
        height: 60px;
    }

    .cover_adds {
        position: absolute;
        left: 0;
        top: 0;
        font-size: 12px;
        color: rgb(8, 8, 148);
        line-height: 18px;
    }

    .ucc_title {
        position: absolute;
        right: 0;
        top: 0;
        text-align: right;
        font-size: 18px;
        line-height: 25px;
        word-spacing: 0.35em;
        font-weight: bold;
    }

    .ucc_logo1 {
        position: absolute;
        left: 44.9%;
        top: 0;
        height: auto;
        width: 90px;
    }

    content {
        font-family: 'Arial Narrow', Arial, sans-serif;
        font-size: 17px;
        display: block;
        padding-top: 50px;
    }

    address {
        font-style: normal;
    }

    .signatory {
        width: 200px;
        height: 130px;
        background-image: url(<?= $_SESSION['settings']['apphost'] ?>/public/images/logo/logo.png);
        background-repeat: no-repeat;
        background-position: 0% 0%;
        background-size: 200px 65px;
        position: relative;
    }

    .signer {
        position: absolute;
        left: 0;
        bottom: 0;
    }

    .salute {
        margin-top: 20px;
    }

    .ref {
        margin-bottom: 20px;
    }

    .end {
        position: relative;
    }

    .copies {
        position: absolute;
        right: 25%;
        top: 0;
    }

    footer {
        margin: 80px 0 10px;
        font-size: 10px;
        font-family: cursive;
        font-style: italic;
    }

    .heading {
        text-align: center;
        background: #b80924;
        color: #fff;
        padding: 10px 5px 10px 60px;
        text-indent: 80px;
    }

    .table {
        border-collapse: collapse;
        width: 100%;
        border: thin solid #000;
        padding: 20px;
        vertical-align: middle;
        text-algn: center;
    }

    .table tr {
        border-bottom: thin solid #000;
    }

    .table td {
        border-right: thin solid #000;
        padding: 10px;
    }

    .certv {
        text-align: center;
    }

    .vbtn {
        padding: 5px;
        margin-top: -20px;
        text-decoration: none;
        font-size: 10px;
        background-color: green;
        color: #fff;
        position: relative;
        top: -10px;
        border-radius: 10px;
    }

    .sbody {
        font-weight: 600;
        font-size: 15px;
        display: inline-block;
    }

    .file_photo {
        display: block;
        height: 120px;
        right: 0;
        float: right;
        margin: -25px 15px 10px 0;
        padding: 2px;
        border: 3px solid #b80924;
        border-radius: 10px;
        background-color: #f1f2f3;
    }

    .marital {
        padding: 5px;
        margin-top: -20px;
        font-size: 15px;
        font-weight: bolder;
        background-color: #b80924;
        text-decoration: none;
        color: #fff;
        position: relative;
        top: 1px;
    }

    .staff_no {
        padding: 5px;
        margin-top: -20px;
        font-size: 15px;
        font-weight: bolder;
        letter-spacing: 0.8em;
        background-color: #0d2d62;
        text-decoration: none;
        color: #fff;
        position: relative;
        top: 1px;
    }


    @media print {
        body {
            background: none;
        }

        .cover {
            padding: 0;
            background: none;
            box-shadow: none;
        }

        .vbtn {
            display: none;
        }
    }
</style>
<header>
    <h1 class="title">UNIVERSITY OF CAPE COAST</h1>
    <h2 class="subtitle">DIRECTORATE OF HUMAN RESOURCE</h2>
    <div class="subnote">
        <div class="cover_adds">
            <dl class="note">
                <dt>Cellphone: <div style="display:inline-block;vertical-align:top;font-weight:bold;">+233-3321-32480/3 Exts.: 223/225/205<br>233-3321-32484/5</div>
                </dt>
                <dt>E-mail:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;vertical-align:top;font-weight:bold;">dhr.enquiries@ucc.edu.gh</div>
                </dt>
                <dt>Website:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;vertical-align:top;font-weight:bold;">www.ucc.edu.gh</div>
                </dt>
            </dl>
        </div>


        <img src="<?= $_SESSION['settings']['apphost'] ?>/public/images/logo/logo.png" alt="UCC LOGO" class="ucc_logo1" />
        <address class="ucc_title">
            UNIVERSITY POST OFFICE<br />
            CAPE COAST, GHANA
        </address>
    </div>
</header>
<content>
    <img src="<?= @$bio['photo'] ?>" class="file_photo" />
    <h5 class="heading"><b> STAFF FILE ON <?= $bio['staff_no'] ?></b></h5>
    <div class="content">
        <?php if (count($doc) > 0) {
            foreach ($doc as $row) {
                if ($row['category'] == 'CV') {
        ?>
                    <!-- <a href="<?= $row['path'] ?>" target="_blank" alt="Curriculum Vitae of <?= $bio['fname'] ?> <?= $bio['lname'] ?> " class="marital">CV</a>-->
        <?php  }
            }
        } ?>
        <a href="javascript:;" target="_blank" alt="" class="staff_no"><?= $bio['nox'] != null ? $bio['nox'] : '' ?></a>
        <a href="javascript:;" target="_blank" alt="" class="marital" style="margin-left:5px;"><?= $bio['staff_status'] != null ? $bio['staff_status'] . ' STAFF' : '' ?></a>
        <a href="javascript:;" target="_blank" alt="" class="marital" style="margin-left:7px;"><?= $bio['staff_group'] != null ? ($bio['staff_group'] == 'SM' ? 'SENIOR MEMBER' : ($bio['staff_group'] == 'SS' ? 'SENIOR STAFF' : 'JUNIOR STAFF')) : '' ?></a>


        <table class="table">
            <!-- Personal Information-->
            <tr>
                <td colspan="2" style="background:pink;">
                    <h5 style="margin-bottom:-5px;"><b> PERSONAL INFORMATION</b></h5>
                </td>
                <td style="background:#f1f2f3;"><a href="javascript:;" target="_blank" alt="" class="marital"><?= 'AGE: ' . $bio['age'] ?></a></td>
            </tr>
            <tr>
                <td><span class="shead">First Name:</span> <span class="sbody"><?= $bio['fname'] != null ? $bio['fname'] : ''; ?> </span></td>
                <td><span class="shead">Middle Name(s):</span> <span class="sbody"><?= $bio['mname'] != null ? $bio['mname'] : ''; ?> </span></td>
                <td><span class="shead">Last Name:</span> <span class="sbody"><?= $bio['lname'] != null ? $bio['lname'] : ''; ?> </span></td>
            </tr>

            <tr>
                <td><span class="shead">Date of Birth:</span> <span class="sbody"><?= $bio['dobx']; ?> </span></td>
                <td><span class="shead">Place of Birth:</span> <span class="sbody"><?= $bio['birth_place'] != null ? $bio['birth_place'] : '' ?> </span></td>
                <td><span class="shead">Home Town:</span> <span class="sbody"><?= $bio['hometown'] != null ? $bio['hometown'] : '' ?> </span></td>
            </tr>

            <tr>
                <td><span class="shead">District:</span> <span class="sbody"><?= $bio['district'] != null ? $bio['district'] : '' ?> </span></td>
                <td><span class="shead">Region:</span> <span class="sbody"><?= $bio['region'] != null ? $bio['region'] : '' ?> </span></td>
                <td><span class="shead">Nationality:</span> <span class="sbody"><?= $bio["country"] != null ? $bio['country'] : '' ?> </span></td>
            </tr>

            <tr>
                <td><span class="shead">Phone:</span> <span class="sbody"><?= $bio['phone'] ?> </span></td>
                <td><span class="shead">Home Address:</span> <span class="sbody"><?= $bio['address'] != null ? $bio['address'] : '' ?> </span></td>
                <td><span class="shead">E-mail:</span> <span class="sbody"><?= $bio['email'] != null ? $bio['email'] : '' ?> </span></td>
            </tr>

            <!-- Family Information-->
            <tr>
                <td colspan="3" style="background:pink;">
                    <h5 style="margin-bottom:-5px;"><b> FAMILY INFORMATION</b></h5>
                </td>
            </tr>
            <?php if (count($rel) > 0) {
                $m = 1;
                foreach ($rel as $row) {
                    if ($row['relation'] == 'MOTHER' || $row['relation'] == 'FATHER' && $m == 1) {
            ?>
                        <tr>
                            <td colspan="3" style="background-color:#eee;">
                                <h6 style="margin-bottom:-5px;background-color:#eee;">PARENTS</h6>
                            </td>
                        </tr>
                    <?php   }
                    $m++;

                    if ($row['relation'] == 'FATHER') {
                    ?>
                        <tr>
                            <td><span class="shead">Father's Full Name:</span> <span class="sbody"><?= $row['name']; ?> </span></td>
                            <td><span class="shead">Father's Home Town:</span> <span class="sbody"><?= $row['hometown'] != null ? $row['hometown'] : '<em>Not provided!</em>' ?></span></td>
                            <td><span class="shead">Father's Address:</span> <span class="sbody"><?= $row['address'] != null ? $row['address'] : '<em>Not provided!</em>' ?></span></td>
                        </tr>
                    <?php }
                    if ($row['relation'] == 'MOTHER') { ?>
                        <tr>
                            <td><span class="shead">Mother's Full Name:</span> <span class="sbody"><?= $row['name']; ?></span></td>
                            <td><span class="shead">Mother's Home Town:</span> <span class="sbody"><?= $row['hometown'] != null ? $row['hometown'] : '<em>Not provided!</em>' ?> </span></td>
                            <td><span class="shead">Mother's Address:</span> <span class="sbody"><?= $row['address'] != null ? $row['address'] : '<em>Not provided!</em>' ?></span></td>
                        </tr>
                <?php  }
                }
            } else { ?>
                <?= '<tr><td colspan="3"><small><em>No Family record!</em></small></td></tr>' ?>
            <?php } ?>


            <?php if (count($rel) > 0) {

                foreach ($rel as $row) {
                    if ($row['relation'] == 'SPOUSE') {  ?>
                        <tr>
                            <td colspan="3" style="background-color:#eee;">
                                <h6 style="margin-bottom:-5px;">SPOUSE</h6>
                            </td>
                        </tr>
                        <tr>
                            <td><span class="shead">Full Name:</span> <span class="sbody"><?= $row['name']; ?></span></td>
                            <td><span class="shead">Contact:</span> <span class="sbody"><?= $row['phone'] != null ? $row['phone'] : '<em>Not provided!</em>' ?> </span></td>
                            <td><span class="shead">UCC-CODE:</span> <span class="sbody"><?= $row['code'] != null ? $row['code'] : '<em>None!</em>' ?> </span></td>
                        </tr>
            <?php  }
                }
            } ?>


            <?php if (count($rel) > 0) {
                $i = 1;
                foreach ($rel as $row) {
                    if ($row['relation'] == 'CHILD') {
                        if ($i == 1) {
            ?>
                            <tr>
                                <td colspan="3" style="background-color:#eee;">
                                    <h6 style="margin-bottom:-5px;">CHILDREN</h6>
                                </td>
                            </tr>
                        <?php    } ?>
                        <tr>
                            <td><span class="shead">Child #<?= $i; ?>:</span> <span class="sbody"><?= $row['name'] . ($row['gender'] != null ? ' (' . $row['gender'] . ')' : ''); ?> </span></td>
                            <td><span class="shead">Date of Birth:</span> <span class="sbody"><?= $row['dobx'] != null ? $row['dobx'] . ($row['dobx'] != 'NOT SET' ? '&nbsp;&nbsp;&nbsp;<em><small>(AGE : ' . $row['age'] . ' )</small></em>' : '') : '<em>Not provided!</em>' ?> </span></td>
                            <td><span class="shead">UCC-CODE:</span> <span class="sbody"><?= $row['code'] != null ? $row['code'] : '<em>None!</em>' ?> </span></td>
                        </tr>
            <?php $i++;
                    }
                }
            } ?>


            <?php if (count($rel) > 0) {
                $i = 1;
                foreach ($rel as $row) {
                    if ($row['relation'] != 'CHILD' && $row['relation'] != 'SPOUSE' && $row['relation'] != 'MOTHER' && $row['relation'] != 'FATHER') {
                        if ($i == 1) {
            ?>
                            <tr>
                                <td colspan="3" style="background-color:#eee;">
                                    <h6 style="margin-bottom:-5px;">OTHER RELATIVES</h6>
                                </td>
                            </tr>
                        <?php    } ?>
                        <tr>
                            <td><span class="shead">Relative #<?= $i; ?>:</span> <span class="sbody"><?= $row['name'] . ' (' . $row['gender'] . ')'; ?> </span></td>
                            <td><span class="shead">Date of Birth:</span> <span class="sbody"><?= $row['dobx'] != null ? $row['dobx'] . ($row['dobx'] != 'NOT SET' ? '&nbsp;&nbsp;&nbsp;<em><small>(AGE : ' . $row['age'] . ' )</small></em>' : '') : '<em>Not provided!</em>' ?></span></td>
                            <td><span class="shead">Relation:</span> <span class="sbody"><?= $row['relation'] != null ? $row['relation'] : '<em>None!</em>' ?> </span></td>
                        </tr>
            <?php $i++;
                    }
                }
            } ?>


            <?php if (count($rel) > 0) {
                $i = 1;
                foreach ($rel as $row) {
                    if ($row['kin'] == '1') {
                        if ($i == 1) {
            ?>
                            <tr>
                                <td colspan="3" style="background-color:#eee;">
                                    <h6 style="margin-bottom:-5px;">NEXT OF KIN(S)</h6>
                                </td>
                            </tr>
                        <?php } ?>
                        <tr>
                            <td><span class="shead">Kin #<?= $i; ?>:</span> <span class="sbody"><?= $row['name']; ?> </span></td>
                            <td><span class="shead">Contact:</span> <span class="sbody"><?= $row['phone'] != null ? $row['phone'] : '' ?></span></td>
                            <td><span class="shead">Relation:</span> <span class="sbody"><?= $row['relation'] != null ? $row['relation'] : 'NOT STATED' ?> </span></td>
                        </tr>
            <?php $i++;
                    }
                }
            } ?>


            <!-- Qualification Information-->
            <tr>
                <td colspan="3" style="background:pink;">
                    <h5 style="margin-bottom:-5px;"><b> CERTIFICATION INFORMATION</b></h5>
                </td>
            </tr>

            <?php if (count($doc) > 0) {  ?>
                <tr>
                    <td colspan="3" style="background-color:#eee;">
                        <h6 style="margin-bottom:-5px;">PERSONAL DOCUMENTS</h6>
                    </td>
                </tr>
                <tr>
                    <?php
                    foreach ($doc as $row) {
                        if ($row['category'] == 'BIRTH') {
                    ?>
                            <td>
                                <span class="sbody">BIRTH CERTIFICATE </span>
                                <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a>
                            </td>
                        <?php }
                        if ($row['category'] == 'MEDICAL') {  ?>
                            <td>
                                <span class="sbody">MEDICAL CERTIFICATE </span>
                                <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a>
                            </td>
                        <?php }
                        if ($row['category'] == 'MARITAL') {  ?>
                            <td>
                                <span class="sbody">MARRIAGE CERTIFICATE </span>
                                <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a>
                            </td>
                    <?php }
                    } ?>
                </tr>
            <?php } ?>


            <?php if (count($cert) > 0) {
                $i = 1;
                foreach ($cert as $row) {
                    if ($i == 1) {
            ?>

                        <tr style="display:none">
                            <td colspan="3" style="background-color:#eee;">
                                <h6 style="margin-bottom:-5px;">ACADEMIC CERTIFICATE(S)</h6>
                            </td>
                        </tr>
                    <?php } ?>
                    <tr style="display:none">
                        <td><span class="shead">Cert #<?= $i ?>:</span> <span class="sbody">1st DEGREE </span></td>
                        <td><span class="sbody"><?= $row['cert_title'] ?> - <em><small>( Awarded: 28/02/2018)</small></em> </span></td>
                        <td>
                            <img class="certv" src="../../public/images/verified_cert.png" />
                            <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a>
                        </td>
                    </tr>
            <?php $i++;
                }
            } ?>


            <!-- University Information-->
            <tr>
                <td colspan="3" style="background:pink;">
                    <h5 style="margin-bottom:-5px;"><b> UNIVERSITY INFORMATION</b></h5>
                </td>
            </tr>
            <tr>
                <td colspan="3" style="background-color:#eee;">
                    <h6 style="margin-bottom:-5px;">SSNIT & BANK DETAILS</h6>
                </td>
            </tr>
            <tr>
                <td><span class="shead">SSNIT Number:</span> <span class="sbody"><?= $bio['ssnit'] != null ? $bio['ssnit'] : '' ?></span></td>
                <td><span class="shead">Bank Account No:</span> <span class="sbody"><?= $bio['account_no'] != null ? $bio['account_no'] : '' ?> </span></td>
                <td><span class="shead">Bank & Branch:</span> <span class="sbody"><?= $bio['bank_name'] != null ? strtoupper($bio['bank_name']) : '' ?>, <?= $bio['account_branch'] != null ? strtoupper($bio['account_branch']) : '' ?> BRANCH </span></td>
            </tr>
            <tr>
                <td colspan="3" style="background-color:#eee;">
                    <h6 style="margin-bottom:-5px;">APPOINTMENT DETAILS</h6>
                </td>
            </tr>
            <tr>
                <td><span class="shead">Current Designation:</span> <span class="sbody"><?= $bio['jobtitle'] != null ? $bio['jobtitle'] : '' ?> </span></td>
                <td><span class="shead">Current Appointment Date:</span> <span class="sbody"><?= $bio['appoint_date'] != null ? $bio['appoint_date'] : 'NOT SET' ?> <!--<br><em><small>( 1 Year Probation Period )</small></em>--></span> </td>
                <td>
                    <span class="shead">First Appointment Date:</span> <span class="sbody"><?= $bio['first_appoint'] != null ? $bio['first_appoint'] : 'NOT SET' ?></span><br>
                    <span class="shead">First Confirmation Date:</span> <span class="sbody"><?= $bio['first_confirm'] != null ? $bio['first_confirm'] : 'NOT SET' ?> </span>
                </td>
            </tr>
            <tr>
                <td colspan="3" style="background-color:#eee;">
                    <h6 style="margin-bottom:-5px;">STAFF DETAILS</h6>
                </td>
            </tr>

            <tr>
                <td><span class="shead">University Staff Number: </span> <span class="sbody"><?= $bio['nox']; ?> </span></td>
                <td><span class="shead">University E-Mail: </span> <span class="sbody"><?= $bio['ucc_mail'] != null ? $bio['ucc_mail'] : '' ?> </span></td>
                <td><span class="shead">Salary & Grade: </span> <span class="sbody"> SSS <?= $bio['grade'] != null ? $bio['grade'] : '' ?> </span></td>
            </tr>


            <!-- Transfer Information   -->
            <?php if (count($trans) > 0) {
                $i = 1;
                foreach ($trans as $row) {
                    if ($i == 1) {
            ?>
                        <tr>
                            <td colspan="3" style="background:pink;">
                                <h5 style="margin-bottom:-5px;"><b> TRANSFER INFORMATION</b></h5>
                            </td>
                        </tr>
                    <?php    } ?>
                    <tr>
                        <td colspan="3" style="background-color:#eee;">
                            <h6 style="margin-bottom:-5px;">TRANSFER #<?= $i ?></h6>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span class="shead">Date of Transfer:</span>
                            <span class="sbody"><?= $row['transdate'] ?> </span>
                        </td>
                        <td>
                            <span class="shead">Transferred From:</span>
                            <span class="sbody"><?= $row['fromunit'] ?> </span>
                        </td>
                        <td>
                            <span class="shead">Transferred To:</span>
                            <span class="sbody"><?= $row['tounit'] ?> </span>
                        </td>
                    </tr>
            <?php $i++;
                }
            } ?>


        </table>

    </div>
</content>
<footer>
    <span><?= 'DHR-' . date('Y') ?></span>
</footer>