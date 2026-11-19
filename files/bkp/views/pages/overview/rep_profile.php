<content>
    <img src="<?= @$bio['photo'] ?>" class="file_photo"/>
    <h2 class="heading">STAFF FILE ON <?= $bio['staff_no'] ?></h2>              
    <div class="content">
        <?php if(count($doc) > 0){ 
            foreach($doc as $row){
                if($row['category'] == 'CV'){ 
        ?>
        <!-- <a href="<?= $row['path'] ?>" target="_blank" alt="Curriculum Vitae of <?= $bio['fname'] ?> <?= $bio['lname'] ?> " class="marital">CV</a>-->
        <?php  } }} ?>
        <a href="javascript:;" target="_blank" alt="" class="staff_no"><?= $bio['nox'] != null ? $bio['nox'] : '' ?></a>
        <a href="javascript:;" target="_blank" alt="" class="marital" style="margin-left:5px;"><?= $bio['staff_status'] != null ? $bio['staff_status'].' STAFF':'' ?></a>
        <a href="javascript:;" target="_blank" alt="" class="marital" style="margin-left:7px;"><?= $bio['staff_group'] != null ? ($bio['staff_group'] == 'SM'? 'SENIOR MEMBER' : ($bio['staff_group'] == 'SS' ? 'SENIOR STAFF' : 'JUNIOR STAFF')) :'' ?></a>
        
        
        <table class="table">
            <!-- Personal Information-->
            <tr><td colspan="2" style="background:pink;"><h4 style="margin-bottom:-5px;">PERSONAL INFORMATION</h4></td><td style="background:#f1f2f3;"><a href="javascript:;" target="_blank" alt="" class="marital"><?= 'AGE: '.$bio['age'] ?></a></td></tr>
            <tr>
                <td><span class="shead">First Name:</span> <span class="sbody"><?= $bio['fname'] != null ? $bio['fname'] :''; ?> </span></td>
                <td><span class="shead">Middle Name(s):</span> <span class="sbody"><?= $bio['mname'] != null ? $bio['mname'] :''; ?>  </span></td>
                <td><span class="shead">Last Name:</span> <span class="sbody"><?= $bio['lname'] != null ? $bio['lname'] :''; ?>  </span></td>
            </tr>

            <tr>
                <td><span class="shead">Date of Birth:</span> <span class="sbody"><?= $bio['dobx']; ?>  </span></td>
                <td><span class="shead">Place of Birth:</span> <span class="sbody"><?= $bio['birth_place'] != null ? $bio['birth_place'] :'' ?>  </span></td>
                <td><span class="shead">Home Town:</span> <span class="sbody"><?= $bio['hometown'] != null ? $bio['hometown'] :'' ?>  </span></td>
            </tr>

            <tr>
                <td><span class="shead">District:</span> <span class="sbody"><?= $bio['district'] != null ? $bio['district'] :'' ?>  </span></td>
                <td><span class="shead">Region:</span> <span class="sbody"><?= $bio['region'] != null ? $bio['region'] : '' ?>  </span></td>
                <td><span class="shead">Nationality:</span> <span class="sbody"><?= $bio["country"] != null ? $bio['country'] : '' ?>  </span></td>
            </tr>

            <tr>
                <td><span class="shead">Phone:</span> <span class="sbody"><?= $bio['phone'] ?>  </span></td>
                <td><span class="shead">Home Address:</span> <span class="sbody"><?= $bio['address'] != null ? $bio['address'] :'' ?>  </span></td>
                <td><span class="shead">E-mail:</span> <span class="sbody"><?= $bio['email'] != null ? $bio['email'] : '' ?>  </span></td>                            
            </tr>

            <!-- Family Information-->
            <tr><td colspan="3" style="background:pink;"><h4 style="margin-bottom:-5px;">FAMILY INFORMATION</h4></td></tr>
            <?php if(count($rel) > 0){
                $m = 1;
                foreach($rel as $row){
                    if($row['relation'] == 'MOTHER' || $row['relation'] == 'FATHER' && $m == 1){
            ?>
                        <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;background-color:#eee;">PARENTS</h6></td></tr>
            <?php   } $m++;   
            
                if($row['relation'] == 'FATHER'){         
            ?>
            <tr>                         
                <td><span class="shead">Father's Full Name:</span> <span class="sbody"><?= $row['name']; ?> </span></td>
                <td><span class="shead">Father's Home Town:</span> <span class="sbody"><?= $row['hometown'] != null ? $row['hometown'] : '<em>Not provided!</em>' ?></span></td>
                <td><span class="shead">Father's Address:</span> <span class="sbody"><?= $row['address'] != null ? $row['address'] : '<em>Not provided!</em>'?></span></td>
            </tr>
            <?php } if($row['relation'] == 'MOTHER'){ ?>
            <tr>
                <td><span class="shead">Mother's Full Name:</span> <span class="sbody"><?= $row['name']; ?></span></td>
                <td><span class="shead">Mother's Home Town:</span> <span class="sbody"><?= $row['hometown'] != null ? $row['hometown'] :'<em>Not provided!</em>' ?> </span></td>
                <td><span class="shead">Mother's Address:</span> <span class="sbody"><?= $row['address'] != null ? $row['address'] : '<em>Not provided!</em>' ?></span></td>
            </tr>
            <?php  }}}else{ ?>
            <?= '<tr><td colspan="3"><small><em>No Family record!</em></small></td></tr>' ?> 
            <?php } ?>
            

            <?php if(count($rel) > 0){
            
            foreach($rel as $row){
                if($row['relation'] == 'SPOUSE'){  ?>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">SPOUSE</h6></td></tr>
            <tr>
                <td><span class="shead">Full Name:</span> <span class="sbody"><?= $row['name']; ?></span></td>
                <td><span class="shead">Contact:</span> <span class="sbody"><?= $row['phone'] != null ? $row['phone'] : '<em>Not provided!</em>' ?> </span></td>
                <td><span class="shead">UCC-CODE:</span> <span class="sbody"><?= $row['code'] != null ? $row['code'] : '<em>None!</em>' ?> </span></td>
            </tr>
            <?php  }}} ?>

            
            <?php if(count($rel) > 0){
                $i = 1;
            foreach($rel as $row){
                if($row['relation'] == 'CHILD'){  
                if($i == 1){
            ?>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">CHILDREN</h6></td></tr>
            <?php    } ?>
            <tr>
                <td><span class="shead">Child #<?= $i; ?>:</span> <span class="sbody"><?= $row['name'].($row['gender'] != null ? ' ('.$row['gender'].')' : ''); ?> </span></td>
                <td><span class="shead">Date of Birth:</span> <span class="sbody"><?= $row['dobx'] != null ? $row['dobx'].($row['dobx'] != 'NOT SET'? '&nbsp;&nbsp;&nbsp;<em><small>(AGE : '.$row['age'].' )</small></em>' : '') : '<em>Not provided!</em>' ?> </span></td>
                <td><span class="shead">UCC-CODE:</span> <span class="sbody"><?= $row['code'] != null ? $row['code'] : '<em>None!</em>' ?> </span></td>
            </tr>
            <?php  $i++; }}} ?>     
            
            
            <?php if(count($rel) > 0){
                $i = 1;
                foreach($rel as $row){
                if($row['relation'] != 'CHILD' && $row['relation'] != 'SPOUSE' && $row['relation'] != 'MOTHER' && $row['relation'] != 'FATHER'){  
                if($i == 1){
            ?>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">OTHER RELATIVES</h6></td></tr>
            <?php    } ?>
            <tr>
                <td><span class="shead">Relative #<?= $i; ?>:</span> <span class="sbody"><?= $row['name'].' ('.$row['gender'].')'; ?> </span></td>
                <td><span class="shead">Date of Birth:</span> <span class="sbody"><?= $row['dobx'] != null ? $row['dobx'].($row['dobx'] != 'NOT SET' ? '&nbsp;&nbsp;&nbsp;<em><small>(AGE : '.$row['age'].' )</small></em>' : '') : '<em>Not provided!</em>' ?></span></td>
                <td><span class="shead">Relation:</span> <span class="sbody"><?= $row['relation'] != null ? $row['relation'] : '<em>None!</em>' ?> </span></td>
            </tr>
            <?php  $i++;}}} ?>              


            <?php if(count($rel) > 0){
            $i = 1;
            foreach($rel as $row){
                if($row['kin'] == '1'){  
                if($i == 1){
            ?>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">NEXT OF KIN(S)</h6></td></tr>
            <?php } ?>
            <tr>
                <td><span class="shead">Kin #<?= $i; ?>:</span> <span class="sbody"><?= $row['name']; ?> </span></td>
                <td><span class="shead">Contact:</span> <span class="sbody"><?= $row['phone'] != null ? $row['phone'] : '' ?></span></td>
                <td><span class="shead">Relation:</span> <span class="sbody"><?= $row['relation'] != null ? $row['relation']: 'NOT STATED' ?> </span></td>
            </tr>
            <?php  $i++; }}} ?>   

            
            <!-- Qualification Information-->
            <tr><td colspan="3" style="background:pink;"><h4 style="margin-bottom:-5px;">CERTIFICATION INFORMATION</h4></td></tr>
            
            <?php if(count($doc) > 0){  ?>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">PERSONAL DOCUMENTS</h6></td></tr>
            <tr>
            <?php
                foreach($doc as $row){
                    if($row['category'] == 'BIRTH'){                                  
            ?>                       
                    <td>
                    <span class="sbody">BIRTH CERTIFICATE </span> 
                    <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a> 
                </td>
            <?php } if($row['category'] == 'MEDICAL'){  ?>
                    <td>
                    <span class="sbody">MEDICAL CERTIFICATE </span> 
                    <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a> 
                </td>  
            <?php } if($row['category'] == 'MARITAL'){  ?> 
                <td>
                    <span class="sbody">MARRIAGE CERTIFICATE </span> 
                    <a href="<?= $row['path'] ?>" target="_blank" class="vbtn" target="_blank">View</a> 
                </td>  
            <?php }} ?>
            </tr>
            <?php } ?>  
            
            
            <?php if(count($cert) > 0){
                $i = 1;
                foreach($cert as $row){
                if($i == 1){
            ?>
            
            <tr style="display:none"><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">ACADEMIC CERTIFICATE(S)</h6></td></tr>
            <?php } ?>
            <tr style="display:none">
                    <td><span class="shead">Cert #<?= $i ?>:</span> <span class="sbody">1st DEGREE </span></td>
                    <td><span class="sbody"><?= $row['cert_title'] ?> - <em><small>( Awarded: 28/02/2018)</small></em> </span></td>
                    <td>
                        <img class="certv" src="../../public/images/verified_cert.png"/>
                        <a href="<?= $row['path'] ?>"  target="_blank" class="vbtn" target="_blank">View</a>                            
                </td>
            </tr>
            <?php  $i++; }} ?> 

            
            <!-- University Information-->
            <tr><td colspan="3" style="background:pink;"><h4 style="margin-bottom:-5px;">UNIVERSITY INFORMATION</h4></td></tr>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">SSNIT & BANK DETAILS</h6></td></tr>
            <tr>
                <td><span class="shead">SSNIT Number:</span> <span class="sbody"><?= $bio['ssnit'] != null ? $bio['ssnit'] : ''?></span></td>
                <td><span class="shead">Bank Account No:</span> <span class="sbody"><?= $bio['account_no'] != null ? $bio['account_no'] : '' ?> </span></td>
                <td><span class="shead">Bank & Branch:</span> <span class="sbody"><?= $bio['bank_name'] != null ? strtoupper($bio['bank_name']):'' ?>, <?= $bio['account_branch'] != null ? strtoupper($bio['account_branch']) : '' ?> BRANCH </span></td>
            </tr>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">APPOINTMENT DETAILS</h6></td></tr>
            <tr>
                    <td><span class="shead">Current Designation:</span> <span class="sbody"><?= $bio['jobtitle'] != null ? $bio['jobtitle'] : ''?> </span></td>
                    <td><span class="shead">Current Appointment Date:</span> <span class="sbody"><?= $bio['appoint_date'] != null ? $bio['appoint_date'] : 'NOT SET' ?>  <!--<br><em><small>( 1 Year Probation Period )</small></em>--></span> </td>
                    <td>
                        <span class="shead">First Appointment Date:</span> <span class="sbody"><?= $bio['first_appoint'] != null ? $bio['first_appoint'] : 'NOT SET' ?></span><br>
                        <span class="shead">First Confirmation Date:</span> <span class="sbody"><?= $bio['first_confirm'] != null ? $bio['first_confirm'] : 'NOT SET' ?> </span>
                </td>
            </tr>
            <tr><td colspan="3" style="background-color:#eee;"><h6 style="margin-bottom:-5px;">STAFF DETAILS</h6></td></tr>
            
            <tr>
                    <td><span class="shead">University Staff Number: </span> <span class="sbody"><?= $bio['nox']; ?> </span></td>
                    <td><span class="shead">University E-Mail: </span> <span class="sbody"><?= $bio['ucc_mail'] != null ? $bio['ucc_mail'] : '' ?> </span></td>
                    <td><span class="shead">Salary & Grade: </span> <span class="sbody"> SSS <?= $bio['grade'] != null ? $bio['grade'] : '' ?> </span></td>
            </tr>                       


        <!-- Transfer Information   -->
        <?php if(count($trans) > 0){
                $i = 1;
                foreach($trans as $row){
                if($i == 1){
            ?>
        <tr>
            <td colspan="3" style="background:pink;">
                <h4 style="margin-bottom:-5px;">TRANSFER INFORMATION</h4>
            </td>
        </tr>
        <?php    } ?>
        <tr>
            <td colspan="3" style="background-color:#eee;">
                <h6 style="margin-bottom:-5px;">TRANSFER #<?= $i?></h6>
            </td>
        </tr>
        <tr>
            <td>
                <span class="shead">Date of Transfer:</span>
                <span class="sbody"><?= $row['transdate'] ?> </span>
            </td>
            <td>
                <span class="shead">Transferred From:</span>
                <span class="sbody"><?= $row['fromunit']?> </span>
            </td>
            <td>
                <span class="shead">Transferred To:</span>
                <span class="sbody"><?= $row['tounit'] ?> </span>
            </td>
        </tr>
        <?php  $i++; }} ?> 
        
        
        </table>
        
    </div>              
</content>