<?php 
// include APPROOT.'/views/includes/nav.php';
// var_dump($data['appraisal_b']);
// var_dump($data);
?>
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 d-print-none">
                <h2 class="d-print-none">Staff Appraisal Form B
                <small class="text-muted">Fill staff appraisal form here</small>
                </h2>
                <hr>
            </div>
        </div>
    </div>    
    <div class="container-fluid">       
        <div class="row clearfix">
            <div class="col-lg-12 col-md-12">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="card">
                            <div class="body">
                                <div class="header d-print-none">
                                    <h2><strong>Appriasal</strong> Senior Staff</h2>
                                </div>
                                
                                <div class="img-post m-b-15">
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                <div class="container-fluid">
                                <div class="col-lg-12 col-md-12 col-sm-12 d-none d-print-block">
                                    <h1 class="hd1 text-center">FORM B </h1>
                                    <h1 class="hd1 text-center">UNIVERSITY OF CAPE COAST </h1>
                                    <h2 class="hd1 text-center">STAFF APPRAISAL FORM </h2>
                                </div>
                                    <div class="row justify-content-center">
                                        <div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center p-0 mt-3 mb-2">
                                            <div class="card px-0 pt-4 pb-0 mb-3">
                                                <!-- <h2 id="heading">Senior Staff Appriasal</h2>
                                                <p class="text-danger">Fill all form field to go to next step</p> -->
                                                <?php if(!empty($data['appraisal_b_data'])):
                                                    foreach($data['appraisal_b_data'] as $appraise){
                                                        $status = $appraise['app_status'];
                                                    }?>
                                                <form id="app_form1" method='POST'>
                                                <fieldset>
                                                        <div class="form-card">
                                                            <div class="row">
                                                                <div class="col-7">
                                                                    <h2 class="fs-title">Personal Details:</h2>
                                                                <!-- <input type="hidden" name="yr_on" placeholder="Staff Number" class="form-control-plaintext" value="<?=$appraise['yr_onreview'];?>"/>-->
                                                                <input type="hidden" name="staff_no" placeholder="Staff Number" class="form-control-plaintext" value="<?=$appraise['staff_no'];?>"/>
                                                                </div>
                                                                <!-- <div class="col-5">
                                                                    <h2 class="steps">Step 1 - 4</h2>
                                                                </div> -->
                                                            </div>
                                                            <div class="row">
                                                            <div class="col-md-6 em">
                                                                <label class="fieldlabels">Name of Employee: </label> 
                                                                <input class="form-control-plaintext" value="<?=$appraise['fname'].' '.$appraise['mname'].' '.$appraise['lname'];?>"/>
                                                                </div>
                                                                <div class="col-md-6 em">
                                                                <label class="fieldlabels">Staff No.: </label> 
                                                                <input class="form-control-plaintext" value="<?=$appraise['staff_no']?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Designation/Rank:</label> 
                                                                <input class="form-control-plaintext" value="<?=$appraise['jobtitle']?>"/>
                                                                </div>
                                                                <div class="col-md-6 em1">
                                                                <label class="fieldlabels">Employee's Department:</label> 
                                                                <input class="form-control-plaintext" value="<?=$appraise['long_name'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                            
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Supervisor's Details:</h2>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Name: *</label> 
                                                                <input type="text" name="supervisor_name" class="form-control-plaintext" id="supervisor_name" placeholder="Supervisor's Name" value="<?=$appraise['supervisor_name'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Supervisor's Designation/Rank: *</label> 
                                                                <input type="text" class="form-control-plaintext" name="supervisors_rank" id="supervisors_rank" placeholder="Supervisors Rank" value="<?=$appraise['supervisors_rank'];?>"/>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <label class="fieldlabels">Year Under Review: *</label>
                                                                <input type="text" class="form-control-plaintext" name="yr_onreview" placeholder="Supervisors Rank" value="<?=$appraise['yr_onreview'];?>"/>
                                                                </div>
                                                            </div><hr>
                                                            <div class="row">
                                                                <div class="col-12">
                                                                    <h2 class="fs-title">Purpose of Current Review:</h2>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                <p class="d-none d-print-block"><?=(($appraise['purpose_curr_review'] == 'Annual Appraisal')?'<i class="zmdi zmdi-check"></i> ':'')?> Annual Appraisal</p>
                                                                    <label class="customcheck d-print-none" for="annual_appraisal">Annual Appraisal
                                                                    <input class="form-check-input" type="checkbox" name="purpose_curr_review[]" disabled <?=(($appraise['purpose_curr_review'] == 'Annual Appraisal')?'checked':'')?> id="annual_appraisal" value="Annual Appraisal">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_signed'] == 'Provisional Mid-Point')?'<i class="zmdi zmdi-check"></i> ':'')?> Provisional Mid-Point</p>
                                                                    <label class="customcheck d-print-none" for="provisional">Provisional Mid-Point
                                                                    <input class="form-check-input" type="checkbox" name="purpose_curr_review[]" disabled <?=(($appraise['purpose_curr_review'] == 'Provisional Mid-Point')?'checked':'')?> id="provisional" value="Provisional Mid-Point">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-md-4 sd">
                                                                    <p class="d-none d-print-block"><?=(($appraise['purpose_curr_review'] == 'Special')?'<i class="zmdi zmdi-check"></i> ':'')?> Special</p>
                                                                    <label class="customcheck d-print-none" for="special">Special
                                                                    <input class="form-check-input" type="checkbox" name="purpose_curr_review[]" disabled <?=(($appraise['purpose_curr_review'] == 'Special')?'checked':'')?> id="special" value="Special">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div> 
                                                    </fieldset>
                                                    <hr><br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                            <div class="row text-center">
                                                                <div class="col-2 sd1">
                                                                    <p>U = Unsatisfactory</p>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p>S = Satisfactory</p>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p>S = Successful</p>
                                                                </div>
                                                                <div class="col-3 sd1">
                                                                    <p>A = Above Expectations</p>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p>E = Exceptional</p>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-7 mb-4">
                                                                    <h2 class="fs-title">Professional Information:</h2>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                            <table class="table-bordered table-sm" style="font-family: Old Standard TT; font-size: 15px; width: 100%">
                                                                <caption class="text-center">U = Unsatisfactory *----------* S = Satisfactory *----------* S = Successful *----------* A = Above Expectations *----------* E = Exceptional</caption>
                                                            <thead class="text-white" style="background-color:#1C2473">
                                                            <tr style="font-size: 12px; text-transform: uppercase;">
                                                                <th class="text-center" width="65%"></th>
                                                                <th class="text-center" width="5.25%">U</th>
                                                                <th class="text-center" width="5.25%">S</th>
                                                                <th class="text-center" width="5.25%">S</th>
                                                                <th class="text-center" width="5.25%">A</th>
                                                                <th class="text-center" width="5.25%">E</th>
                                                                <th class="text-center" width="10%">Examples to Support Rating</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                                
                                                            <?php //var_dump($data['appraisal_b_data']); 
                                                            foreach($data['appraisal_b_data'] as $app_data): 
                                                                $q_data = explode(':', $app_data['question']);
                                                                ?>                                                            
                                                            <tr style="font-size: 14px; background-color: #D2D2D2;">
                                                                <td class="p-2" width="50%"><?php echo $app_data['cat_name']; ?>
                                                            </tr>
                                                            <?php foreach($q_data as $questions):
                                                                $quest = explode('|', $questions);
                                                                // print_r($quest);
                                                                ?>
                                                            <tr style="font-size: 14px;">
                                                                <td class="pl-5" width="50%"><ul><li><?php echo $quest[0]; ?></li></ul></td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'U')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="Unsatisfactory">
                                                                    <input type="checkbox" disabled class="form-check-input" id="Unsatisfactory" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'S')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="Satisfactory">
                                                                    <input type="checkbox" disabled class="form-check-input" id="Satisfactory" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                    <!-- <input type="checkbox" disabled class="form-check-input" id="Satisfactory" name="radiobtn[]" <?=(($quest[1] == 'S')?'checked':'');?> value="<?=$quest[0].':'.'S';?>"> -->
                                                                </td>   
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'X')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="Successful">
                                                                    <input type="checkbox" disabled class="form-check-input" id="Successful" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                    <!-- <input type="checkbox" disabled class="form-check-input" id="Successful" name="radiobtn[]" <?=(($quest[1] == 'X')?'checked':'');?> value="<?=$quest[0].':'.'S';?>"> -->
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'A')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="above_expectations">
                                                                    <input type="checkbox" disabled class="form-check-input" id="above_expectations" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                    <!-- <input type="checkbox" disabled class="form-check-input" id="Above Expectations" name="radiobtn[]" <?=(($quest[1] == 'A')?'checked':'');?> value="<?=$quest[0].':'.'A';?>"> -->
                                                                </td>
                                                                <td class="text-center" width="5.25%">
                                                                <?=(($quest[1] == 'E')?'<p class="d-none d-print-block"><i class="zmdi zmdi-check"></i></p>
                                                                <label class="customcheck ml-3 mb-4 d-print-none" for="exceptional">
                                                                    <input type="checkbox" disabled class="form-check-input" id="exceptional" checked>
                                                                    <span class="checkmark"></span>
                                                                    </label>':'');?>
                                                                    <!-- <input type="checkbox" disabled class="form-check-input" id="Exceptional" name="radiobtn[]" <?=(($quest[1] == 'E')?'checked':'');?> value="<?=$quest[0].':'.'E';?>"> -->
                                                                </td>
                                                                <td class="text-center" width="25%">
                                                                    <input type="text" id="support_eg" class="form-control-plaintext" readonly name="support_eg[]" value="<?=$quest[2];?>">
                                                                </td>
                                                            </tr>
                                                            <?php 
                                                         endforeach;?>
                                                            <?php endforeach;
                                                            ?>
                                                            </tbody>
                                                            </table>
                                                            </div>
                                                        </div> 
                                                    </fieldset><br> <br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels">Summary of Current Year Objectives: *</label>
                                                                <textarea name="curr_year_obj" id="curr_year_obj" rows="3" readonly class="form-control-plaintext" placeholder="- Summary of Current Year Objectives"><?=$appraise['curr_year_obj'];?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Identify Development Needs (Specified areas): *</label> 
                                                                <textarea name="dev_needs" id="dev_needs" rows="3" readonly class="form-control-plaintext" placeholder="- Identify Development Needs (Specified areas)"><?=$appraise['dev_needs'];?></textarea>
                                                                </div>
                                                                <div class="col-md-12 col-sm-12 col-lg-12 mb-4">
                                                                <label class="fieldlabels"> Supervisor’s Overall Summary: *</label> 
                                                                <textarea name="overall_summary" id="overall_summary" rows="3" readonly class="form-control-plaintext" placeholder="- Supervisor’s Overall Summary"><?=$appraise['overall_summary'];?></textarea>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Supervisor’s Overall Rating (tick):</h2>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Unsatisfactory')?'<i class="zmdi zmdi-check"></i> ':'')?> Unsatisfactory</p>
                                                                    <label class="customcheck d-print-none" for="Unsatisfactory">Unsatisfactory
                                                                    <input type="checkbox" name="sup_rating" class="form-check-input" disabled id="unsatisfactory" <?=(($appraise['sup_rating'] == 'Unsatisfactory')?'checked':'')?> value="Unsatisfactory">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'satisfactory')?'<i class="zmdi zmdi-check"></i> ':'')?> Satisfactory</p>
                                                                    <label class="customcheck d-print-none" for="satisfactory">Satisfactory
                                                                    <input type="checkbox" name="sup_rating" class="form-check-input" disabled id="satisfactory"<?=(($appraise['sup_rating'] == 'satisfactory')?'checked':'')?> value="satisfactory">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Successful')?'<i class="zmdi zmdi-check"></i> ':'')?> Successful</p>
                                                                    <label class="customcheck d-print-none" for="successful">Successful
                                                                    <input type="checkbox" name="sup_rating" class="form-check-input" disabled id="successful"<?=(($appraise['sup_rating'] == 'Successful')?'checked':'')?> value="Successful">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-3 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Above Expectations')?'<i class="zmdi zmdi-check"></i> ':'')?> Above Expectations</p>
                                                                <label class="customcheck d-print-none" for="above_expectations">Above Expectations
                                                                    <input type="checkbox" name="sup_rating" class="form-check-input" disabled id="above_expectations"<?=(($appraise['sup_rating'] == 'Above Expectations')?'checked':'')?> value="Above Expectations">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <div class="col-2 sd1">
                                                                    <p class="d-none d-print-block"><?=(($appraise['sup_rating'] == 'Exceptional')?'<i class="zmdi zmdi-check"></i> ':'')?> Exceptional</p>
                                                                <label class="customcheck d-print-none" for="exceptional">Exceptional
                                                                    <input type="checkbox" name="sup_rating" class="form-check-input" disabled id="exceptional" <?=(($appraise['sup_rating'] == 'Exceptional')?'checked':'')?> value="Exceptional">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <hr><br>
                                                            <div class="col-md-12 col-sm-12 col-lg-12">
                                                            <label class="fieldlabels"> Employee Comments (Optional): </label> 
                                                            <textarea name="emp_comments" id="emp_comments" class="form-control-plaintext" rows="3" <?=((!empty($appraise['emp_comments']))?'readonly':'')?> placeholder="- Employee Comments (Optional)"><?=$appraise['emp_comments']?></textarea>
                                                            </div>
                                                            </div>
                                                             
                                                    </fieldset><br><br>
                                                    <fieldset>
                                                        <div class="form-card">
                                                        <div class="row">
                                                                <div class="col-12 mb-4">
                                                                    <h2 class="fs-title">Finalization:</h2>
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="supervisor_name">Supervisor's Name: *</label> 
                                                                <input type="text" name="supervisor_name" class="form-control-plaintext" value="<?=$appraise['supervisor_name']?>" disabled placeholder="Supervisors Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appraise['sup_signed'] == 'Supervisor Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Supervisor Signed</p>
                                                                <label class="customcheck d-print-none" for="sup_signed">Supervisor Signed
                                                                    <input type="checkbox" name="sup_signed" disabled class="form-check-input" id="sup_signed" <?=(($appraise['sup_signed'] == 'Supervisor Signed')?'checked':'')?> value="Supervisor Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                <!-- <input type="button" name="previous" class="previous action-button-previous" value="Previous" /> -->
                                                                </div>
                                                                <div class="col-md-6 row bg-light p-5 rounded mm">
                                                                <div class="col-md-12 mb-3">
                                                                <label class="fieldlabels" for="employee_name">Employee Name: *</label> 
                                                                <input type="text" name="employee_name" value="<?=$appraise['fname'].' '.$appraise['mname'].' '.$appraise['lname'];?>" readonly class="form-control-plaintext" placeholder="Employee Name"/>
                                                                </div>
                                                                <div class="col-md-12 mt-4">
                                                                <p class="d-none d-print-block"><?=(($appraise['emp_signed'] == 'Employee Signed')?'<i class="zmdi zmdi-check"></i> ':'')?> Employee Signed</p>
                                                                <label class="customcheck d-print-none" for="emp_signed">Employee Signed
                                                                    <input type="checkbox" name="emp_signed" class="form-check-input" id="emp_signed" <?=(($appraise['emp_signed'] == 'Employee Signed')?'checked disabled':'')?> value="Employee Signed">
                                                                    <span class="checkmark"></span>
                                                                    </label>
                                                                </div>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                        
                                                    </fieldset>
                                                    <input type="hidden" name="staff_app_id" id="staff_app_id" value="<?=$appraise['staff_app_id']?>"/>
                                                    <?=(($status == 2)?'<button class="btn btn-block d-print-none" onclick="print()" 
                                                        style="background-color:#d3242c;" style="width:100%;"><i class="zmdi zmdi-print"></i> Print </button>':
                                                        '<input type="submit" name="submit" id="submit" class="btn btn-block" style="background-color:#d3242c" value="Submit"/>')?> 
                                                </form>
                                                <?php else: 

                                                    foreach($data['getstdata'] as $staff_data){
                                                    }?>
                                                    <form id="app_form1" method='POST'>
                                                    <div class="mt-5 text-center" role="alert">
                                                    <marquee behavior="alternate" direction="up" width="80%">
                                                        <marquee direction="right" behavior="alternate"><h4>******** <strong>Appraisal yet to be filled by supervisor</strong> ********</h4></marquee>
                                                    </marquee>
                                                    </div>
                                                </form>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    
                                </div>
                            </div>
                            </div>
                        </div>                
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>


<?php 
// include APPROOT."/views/includes/footer.php";
?>
