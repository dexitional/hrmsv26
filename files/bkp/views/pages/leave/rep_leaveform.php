 
<content>
    <img src="<?= $data['photo'] ?>" class="file_photo"/>
    <h2 class="heading"><?= $title ?></h2>              
    <div class="content">
        
        <a class="marital">STAFF NO   </a>                 
        <a href="javascript:;" class="staff_no"><?= $data['staff_no'] != null ? $data['staff_no'] : '' ?></a>
    
        
        <table class="table">
            <!-- Personal Information-->
            <tr><td colspan="2"><h4 style="margin-bottom:-5px;">PART I ( Completed by applicant)</h4></td><td><a href="javascript:;" target="_blank" alt="" class="marital"><?= $data['status'] != null ? $data['status'] : '' ?></a></td></tr>
            <tr><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">I HUMBLY WISH TO APPLY FOR MY LEAVE FOR THE YEAR, BELOW ARE MY DETAILS:</h6></td></tr>
            <tr>
                <td align="left" colspan="2"><span class="shead">Full Name:</span> <span class="sbody"><?= $data['fname'] != null ? strtoupper($data['fname']).' '.($data['mname'] != null ? strtoupper($data['mname']):'').' '.strtoupper($data['lname']) :'' ?> </span></td>
                <td align="left"><span class="shead">Designation:</span> <span class="sbody"><?= $data['jobtitle'] != null ? strtoupper($data['jobtitle']) :'' ?></span></td>
            </tr>
            <tr>
            <td align="left"><span class="shead">Leave Type:</span> <span class="sbody"><?= $data['title'] != null ? strtoupper($data['title']):'' ?> </span></td>
            <td align="left"><span class="shead">Leave Year:</span> <span class="sbody"><?= $data['year'] ?></span></td>
            <td align="left"><span class="shead">Date Applied:</span> <span class="sbody"><?= $data['adate'] != null ? strtoupper($data['adate']) :'' ?></span></td>
            </tr>
            <tr><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">EMERGENCY DETAILS & CONTACT PERSON WHILE ON LEAVE</h6></td></tr>
            <tr>
            <td align="left" colspan="2"><span class="shead">Nearest Contact Person & Address:</span> <span class="sbody"><?= $data['emergency_note'] != null ? strtoupper($data['emergency_note']) :'' ?> </span></td>
            <td align="left"><span class="shead">Contact Person's Phone:</span> <span class="sbody"><?= $data['emergency_contact'] ?></span></td>
            </tr>
            <tr><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">APPLICANT'S CURRENT AND/OR PREVIOUS LEAVE STATISTICS</h6></td></tr>
            <tr>
                <td colspan="3">
                    <table class="table" style="background:pink;color:darkred"> 
                        <tr>
                            <!-- <th>Current Leave Entitlement</th>-->
                            <!--<th>Outstanding Leave/Over Time Days</th>-->
                            <!--<th>Days Already Taken</th>-->
                            <th>Leave Due</th>
                            <th>Approved Days to be taken</th>
                            <th>Leave Period (From)</th>
                            <th>Leave Period (To)</th>
                            <th>Date of Resumption</th>
                        </tr>                                   
                        <tr style="background:#f8f9fa">
                            <!--<td><%- data.entitlement  %></td>-->
                            <!--<td>Outstanding Leave/Over Time Days</td>-->
                            <!--<td>Days Already Taken</td>-->
                            <td><?= $data['entitlement'] ?></td>
                            <td><?= $data['approved_days'] ?></td>
                            <td><?= $data['start'] != null ? strtoupper($data['start']) :'' ?></td>
                            <td><?= $data['end'] != null ? strtoupper($data['end']) :'' ?></td>
                            <td><?= $data['resume'] != null ? strtoupper($data['resume']) :'' ?></td>
                        </tr>

                    </table>
                </td>                            
            </tr>

            <?php if($data['uhead'] != null){ ?>
            
            <!-- Head of Department Information-->
            <tr><td colspan="3"><h4 style="margin-bottom:-5px;">PART II - Completed by Applicant's Head of Department/Section</h4></td></tr>
            <tr><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">LEAVE APPLICATION ENDORSED OR CERTIFIED BY:</h6></td></tr>
            <tr>
                <td align="left"><span class="shead">Full Name:</span> <span class="sbody"><?= $data['uhead'] ?> </span></td>
                <td align="left"><span class="shead">Designation:</span> <span class="sbody">N/A</span></td>
                <td align="left"><span class="shead">Date Endorsed:</span> <span class="sbody"><?= $data['udate'] ?></span></td>
            </tr>
            <tr><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">APPLICANT RELIEVED BY :</h6></td></tr>
            <tr>
                <td align="left" colspan="3"><span class="shead">Relieved By:</span> <span class="sbody"><?= $data['relieve'] ?> </span></td>
            </tr>   
            
            <?php } if($data['hhead'] != null){ ?>
            <!-- Head of HR Information-->
            <tr><td colspan="3"><h4 style="margin-bottom:-5px;">PART III - Completed by the Registrar (HR)</h4></td></tr>
            <tr><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">LEAVE APPLICATION ENDORSED OR CERTIFIED BY:</h6></td></tr>
            <tr>
                <td align="left"><span class="shead">Full Name:</span> <span class="sbody"><?= $data['hhead'] ?> </span></td>
                <td align="left"><span class="shead">Designation:</span> <span class="sbody">N/A</span></td>
                <td align="left"><span class="shead">Date Approved:</span> <span class="sbody"><?= $data['hdate'] ?></span></td>
            </tr>
            <tr style="display:none"><td colspan="3" style="background-color:#eee;text-align:left;"><h6 style="margin-bottom:-5px;background-color:#eee;">NOTICES:</h6></td></tr>
            <tr style="display:none">
                <td align="left" colspan="3"><span class="sbody"><em>Please, note that leave for the current year may not be carried over to next unless approval for its deferment has been given by the Registrar, in writing, on recommendation of the Head of Department/Section, at least three(3) months before the leave is due.<br><br><b>Leave not properly deferred shall be forfeited.</b></em></span></td>
            </tr>
            <?php } ?>

            <?php if($data['status'] == 'HEAD-REJECTED'){ ?>
            <?= '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave Application was rejected or declined by Unit/Section Head! </em></small></td></tr>' ?> 
            <?php }else if($data['status'] == 'HR-REJECTED'){ ?>
            <?= '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave Application was rejected or declined by DHR! </em></small></td></tr>' ?> 
            <?php }else if($data['status'] == 'HR-PENDING'){ ?>
            <?= '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave Application is under review and being processed by DHR! </em></small></td></tr>' ?> 
            <?php }else if($data['status'] == 'HEAD-PENDING'){ ?>
            <?= '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave Application is pending approval by Unit/Section Head! </em></small></td></tr>' ?> 
            <?php }else if($data['status'] == 'STAFF-PENDING'){ ?>
            <?= '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave Application needs another review by Unit Staff or Applicant! </em></small></td></tr>' ?> 
            <?php }else if($data['status'] == 'GRANTED'){ ?>
            <?php '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave Application is approved by DHR and running! </em></small></td></tr>' ?> 
            <?php }else if($data['status'] == 'ENDED'){ ?>
            <?= '<tr style="background-color:pink;font-weight:bolder;font-size:23px;"><td colspan="3"><small><em>Leave days applied is exhausted by Applicant! </em></small></td></tr>' ?> 
            <?php } ?>
                        
        </table>
        
    </div>              
</content>
         