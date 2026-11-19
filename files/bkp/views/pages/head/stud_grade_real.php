<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>self verification</title>
    <style type="text/css">
        .style1 {
            font-size: 12px
        }

        .style3 {
            font-size: 36px;
            font-weight: bold;
        }

        .style6 {
            font-size: 18px;
            font-weight: bold;
        }

        .style8 {
            font-size: 12px;
            font-weight: bold;
        }

        body {
            margin-top: 0px;
            margin-bottom: 0px;
        }
    </style>
</head>

<body>

    <p align="center">
        <a href="gradeprint.php" target="_blank" class="style2" onclick="Popup=window.open('gradeprint.php','Popup','toolbar=no,location=no,status=no,menubar=yes,scrollbars=yes,resizable=no, width=780,height=2500,left=0,top=0' ); return false;">
            <strong>Print preview</strong>
        </a>
    </p>

    <p></p>

    <p align="center">
        <font color="#FF0000" size="-2" style="font-family:Verdana, Geneva, sans-serif">
            <strong>NOTE:</strong> <br />
            The Status for each Course is displayed below; <br />
            <strong>Inactive:</strong> Pending to be assingned to Lecturer <br />
            <strong>With Lect:</strong> Assessment Sheet with Lecturer<br />
            <strong>With Dept:</strong> Assessment Sheet with Department<br />
            <strong>With Facty:</strong> Assessment Sheet with Faculty, pending approval
        </font>
    </p>


    <p>

        <?php
        // var_dump($data);die();
        // var_dump($cce_student);
        // var_dump($get_summary_stats);
        // var_dump($query_rs_session);
        // var_dump($query_rs_grade);
        // var_dump($query_rs_gpa);
        // var_dump($query_rs_cgpa);
        // var_dump($data);
        // echo $query_rs_session['session'];
        // die();
        // $session = $query_rs_session['session'];
        //             $lsession = substr("$session", -1, 1);
        //             if ($lsession == 1) {
        //                 echo $semester = 'First Semester';
        //             } else {
        //                 echo $semester = 'Second Semester';
        //             }

        //             $endsession = substr("$session", 0, 4);
        //             $startsession = ($endsession - 1);
        //             $acayear = 'Academic Year';
        // die();
        do {
            $regno = $data['regno'];
            $session = $query_rs_session['session'];
                    $lsession = substr("$session", -1, 1);
                    if ($lsession == 1) {
                        $semester = 'First Semester';
                    } else {
                        $semester = 'Second Semester';
                    }

                    $endsession = substr("$session", 0, 4);
                    $startsession = ($endsession - 1);
                    $acayear = 'Academic Year';

                    res_course_query($regno, $session);die();

            //         $query_rs_grade = "SELECT t1.status, 
            //     t1.code AS CODE,
            //     t1.title AS TITLE,
            //     t1.cr AS CR,
            //     t1.flag, 
            //     t1.audit,
            //     t1.resit
            //    ,if(t1.runtype IN (5,3) and t1.session = t4.session and t4.name='spsession' and t3.cf >t3.payable,'owe fees'
            //    ,t1.gd) GD,
            //    if(t1.runtype IN (5,3) and t1.session = t4.session and t4.name='spsession' and t3.cf >t3.payable,'XXX'
            //    ,t1.gp) GP,t1.session
            //    FROM portalviews.assessment AS t1
            //    left join osisfin.student_financials AS t3 on t3.regno=t1.regno
            //    left join osal.active_sessions AS t4 on t4.session=t1.session
            //         WHERE t1.regno = '$userid' AND t1.session = '$session' 
            //         ORDER BY code ASC";
            //         $rs_grade = mysql_query($query_rs_grade, $dbconnect1) or die(mysql_error());
            //         $query_rs_grade = mysql_fetch_assoc($rs_grade);
            //         $totalRows_rs_grade = mysql_num_rows($rs_grade);

            //         $query_rs_gpa = "SELECT DISTINCT 
            //         ROUND( SUM(IF(`flag`=0, '0', `gp`)) / SUM(`cr`), 4 ) GPA, 
            //         SUM( IF(`flag`=0, 0, `gp`) ) TGP, 
            //         SUM(`cr`) TCR 
            //         FROM portalviews.`assessment` 
            //         WHERE `regno` = '$userid' AND `session` = '$session' AND `audit` = 0
            //         GROUP BY `regno`";
            //         $rs_gpa = mysql_query($query_rs_gpa, $dbconnect1) or die(mysql_error());
            //         $row_rs_gpa = mysql_fetch_assoc($rs_gpa);
            //         $totalRows_rs_gpa = mysql_num_rows($rs_gpa);

            //         $query_rs_cgpa = "SELECT DISTINCT 
            //         ROUND( SUM(IF(`flag`=0, '0', `gp`)) / SUM(`cr`), 4 ) GPA 
            //         FROM portalviews.`assessment` 
            //         WHERE `regno` = '$userid' AND `session` <= '$session' AND `audit` = 0 
            //         GROUP BY `regno`";
            //         $rs_cgpa = mysql_query($query_rs_cgpa, $dbconnect1) or die(mysql_error());
            //         $row_rs_cgpa = mysql_fetch_assoc($rs_cgpa);
            //         $totalRows_rs_cgpa = mysql_num_rows($rs_cgpa);
        ?>
    <table width="740" align="center" style="border:solid; border-color:#000000; border-width:thin ">
        <tr>
            <td colspan="5">
                <div align="left">
                    <span class="style1">
                        <em><strong><?php echo "$startsession", "/", "$endsession", " ", "$acayear", ",", " ", "$semester"; ?></strong></em>
                    </span>
                </div>
            </td>
        </tr>
        <tr bgcolor="#ACACAC">
            <td width="55">
                <div align="left"><span class="style8">CODE</span></div>
            </td>
            <td width="565">
                <div align="left"><span class="style8">TITLE</span></div>
            </td>
            <td width="80"><span class="style8"></span></td>

            <td width="40">
                <div align="left"><span class="style8">CR</span></div>
            </td>
            <td width="40">
                <div align="left"><span class="style8">GD</span></div>
            </td>
            <td width="40">
                <div align="left"><span class="style8">GP</span></div>
            </td>
        </tr>

        <?php do { ?>
            <tr bgcolor="#EEEEEE">
                <td>
                    <div align="left"><span class="style8"><?php echo $query_rs_grade['CODE']; ?></span></div>
                </td>
                <td>
                    <div align="left"><span class="style8"><?php echo $query_rs_grade['TITLE']; ?></span></div>
                </td>

                <td><span class="style1">
                        <?php
                        $status = $query_rs_grade['status'];
                        $flag = $query_rs_grade['flag'];

                        if ($flag == 0) {
                            switch ($status) {
                                case "1":
                                    $desc = "Inactive.";
                                    break;
                                case "2":
                                    $desc = "With Lect.";
                                    break;
                                case "0":
                                    $desc = "With Dept.";
                                    break;
                                case "3":
                                    $desc = "With Facty.";
                                    break;
                                default:
                                    $desc = "";
                            }
                            echo $desc;
                        }
                        ?>
                    </span></td>

                <td><span class="style8"><?php echo $query_rs_grade['CR']; ?></span></td>
                <td><span class="style8">
                        <?php
                        if ($flag == 0) {
                            if ($status < 4) {
                                echo "IC";
                            }
                        } else {
                            echo $query_rs_grade['GD'];
                        }
                        ?>
                    </span></td>

                <td><span class="style8">
                        <?php
                        if ($flag == 0) {
                            if ($status < 4) {
                                echo "0";
                            }
                        } else {
                            echo $query_rs_grade['GP'];
                        }
                        ?>
                    </span></td>
            </tr>
        <?php } while ($query_rs_grade = mysql_fetch_assoc($rs_grade)); ?>
        <tr bgcolor="#ACACAC">
            <td colspan="2" bgcolor="#ACACAC">
                <div align="left">
                    <span class="style8">GPA= <?php echo $row_rs_gpa['GPA'] . ' ' . ','; ?> CGPA=<?php echo $row_rs_cgpa['GPA']; ?></span>
                </div>
            </td>
            <td>
                <div align="left"></div>
            </td>
            <td>
                <div align="left"><span class="style1"></span><span class="style8"><?php echo $row_rs_gpa['TCR']; ?></span></div>
            </td>
            <td><span class="style1"></span></td>
            <td>
                <div align="left"><span class="style8"><?php echo $row_rs_gpa['TGP']; ?></span></div>
            </td>
        </tr>
    </table>
    <div align="center"> <br />
    <?php } while ($row_rs_session); ?>
    <!-- <?php //} while ($row_rs_session = mysql_fetch_assoc($rs_session)); ?> -->

    <?php if (cce_student($userid)) {
        $summary = get_summary_stats($userid); ?>
        <br>
        <table width="740" align="center" style="border:solid; border-color:#000000; border-width:thin">
            <tr>
                <td colspan="5"><b>NUMBER OF ICs</b></td>
                <td><?php echo $summary['IC']; ?></td>
            </tr>
            <tr>
                <td colspan="5"><b>NUMBER OF Es</b></td>
                <td><?php echo $summary['E']; ?></td>
            </tr>
            <tr>
                <td colspan="5"><b>CGPA</b></td>
                <td><?php echo $summary['CGPA']; ?></td>
            </tr>
            <?php if ($summary['CGPA'] < 1) { ?>
                <tr>
                    <td colspan="6"><b style="color:red;">To obtain a certificate your CGPA should be greater than 1</b></td>
                </tr>
            <?php } ?>
        </table>
        <br>
    <?php } ?>

    <a href="gradeprint.php" target="_blank" class="style2" onclick="Popup=window.open('gradeprint.php','Popup','toolbar=no,location=no,status=no,menubar=yes,scrollbars=yes,resizable=no, width=780,height=2500,left=0,top=0' ); return false;"><strong>Print preview</strong></a>
    </div>

</body>

</html>
<?php
/*
mysql_free_result($rs_session);
mysql_free_result($rs_grade);
mysql_free_result($rs_gpa);
mysql_free_result($rs_cgpa);
mysql_free_result($rs_studdetails);
*/
?>