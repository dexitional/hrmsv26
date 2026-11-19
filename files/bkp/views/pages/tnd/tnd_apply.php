
<?php //var_dump($data1[0]); ?>
<style>
#high_edu,#study_leave,#inpfm {border-style: solid;
  border-color: #d5d5d5;
height: 20px;
width: 93.2%;}
.clcin:hover {background-color: #F5F5F5;
color:black;}

#clcin2 {background-color: #F5F5F5;
color:black;
width:40px;
height: 40px;}

#clcin2:hover {background-color: #F5F5F5;
color:black;
width:50px;
height: 50px;}

#inpfm2, #position {border-style: solid;
  border-color: #d5d5d5;
height: 40px;}

#comment {border-style: solid;
  border-color: #d5d5d5;}
#comment:hover {background-color: #F5F5F5;}
</style>
<?php $today = date('Y-m-d');

// Define the valid start and end dates
$start = date('Y') . '-07-01';
$end = date('Y') . '-11-21';
// var_dump(value: $data2);
if($data2[0]['created_at'] != null && $data2[0]['created_at'] != '') {
$start_date = $data2[0]['created_at'];
}else {
$start_date = '2024-01-01'; // Default date if appoint_date is null or empty
//$start_date = date('Y-m-d'); // Default date if appoint_date is null or empty
}
// $appointDate = new DateTime($start_date);
$now = new DateTime(); // current date

// $threeYearsFromNow = new DateTime();
// $threeYearsFromNow->add(new DateInterval('P3Y'));
// echo $start_date;
// Calculate the difference in years
// $threeYearsAgo = $now->add(new DateInterval('P3Y'));
// $twoYearsAgo = $now->add(new DateInterval('P2Y'));

// echo $threeYearsAgo->format('Y-m-d');
// echo $twoYearsAgo->format('Y-m-d');
// echo $appointDate->format('Y-m-d');
// echo $start_date;

$appointDate = new DateTime($start_date);
$appointDate1 = new DateTime($start_date);
$twoYearsAgo = new DateTime('-2 years');
$threeYearsAgo = new DateTime('-3 years');

// Find differences
$diff = $twoYearsAgo->diff($appointDate);
$diff3 = $threeYearsAgo->diff($appointDate1);

// Determine sign for 2 years comparison
$sign2 = ($appointDate > $twoYearsAgo) ? '-' : '+';

// Determine sign for 3 years comparison
$sign3 = ($appointDate1 > $threeYearsAgo) ? '-' : '+';

// Output differences with sign
$sign3 . $diff3->y . " years, " . $diff3->m . " months, " . $diff3->d . " days<br>";
$sign2 . $diff->y . " years, " . $diff->m . " months, " . $diff->d . " days<br>";

// Get total years for 2 years comparison
$totalYears = $diff->y + ($diff->m / 12) + ($diff->d / 365);
$total_form = $sign2 . number_format($totalYears, 2);

$totalYears3 = $diff3->y + ($diff3->m / 12) + ($diff3->d / 365);
$total_form3 = $sign3 . number_format($totalYears3, 2);

if (($total_form3 < 0 && $data2[0]['staff_group'] == 'SS')) { ?>
 <marquee behavior="left" direction="" class="mt-5"><h1>You must have at least 3 years of service to be eligible to complete the Declaration Form.</h1></marquee>
<?php 
}elseif (($total_form < 0 && $data2[0]['staff_group'] == 'SM')) { ?>
 <marquee behavior="left" direction="" class="mt-5"><h1>You must have at least 2 years of service to be eligible to complete the Declaration Form.</h1></marquee>
<?php }elseif ($today >= $start && $today <= $end) {?>
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 bg-light">
            <h5 class="light-blue-text text-darken-4 mt-5 text-uppercase">Application form for declaration of intention to pursue further studies</h5>
          <hr>
                <!-- <h2>Apply for Promotion
                <small class="text-muted">Apply for promotion here</small>
                </h2> -->
            </div>
            <!-- <div class="col-lg-5 col-md-6 col-sm-12">                 -->
                <!-- <button class="btn btn-primary btn-icon btn-round hidden-sm-down float-right m-l-10" type="button">
                    <i class="zmdi zmdi-plus"></i>
                </button> -->
                <!-- <ul class="breadcrumb float-md-right"> -->
                    <!-- <li class="breadcrumb-item"><a href="<?php //echo URLROOT; ?>/pages/index"><i class="zmdi zmdi-home"></i> Main</a></li> -->
                    <!-- <li class="breadcrumb-item"><a href=""><i class="zmdi zmdi-home"></i> Main</a></li>
                    <li class="breadcrumb-item"><a href="javascript:void(0);">Staff</a></li>
                    <li class="breadcrumb-item active">Apply for Promotion</li>
                </ul>                
            </div> -->
        </div>
    </div>    
    <div class="container-fluid">       
        <div class="row clearfix">
            <div class="col-lg-12 col-sm-12 col-md-12 card bg-light">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="card">
                            <div class="body text-white">
                                
                                <div class="img-post m-b-15">
                                <div class="col-lg-12 col-md-12 col-sm-12">
                                    <form id="tndapply" method="post">
                                    <!--<form action="send_promo" method="post" enctype="multipart/form-data">-->
                                    <?php
                                        $applicant_name = trim(($data2[0]['title'] ?? '') . ' ' . ($data2[0]['fname'] ?? '') . ' ' . ($data2[0]['mname'] ?? '') . ' ' . ($data2[0]['lname'] ?? ''));
                                        $applicant_name = preg_replace('/\s+/', ' ', $applicant_name);
                                    ?>
                                    <div class="row">
                                        <div class="col-12">
                                            <div class="card border-0 shadow-sm mb-4" style="background:#eef2fb; border-radius:8px;">
                                                <div class="card-body py-3">
                                                    <h6 class="text-uppercase font-weight-bold mb-3" style="color:#273B73; letter-spacing:.5px;">Applicant Details</h6>
                                                    <div class="row">
                                                        <div class="col-md-6 col-lg-3 mb-2 mb-lg-0">
                                                            <div class="text-muted text-uppercase" style="font-size:11px; letter-spacing:.5px;">Staff Name</div>
                                                            <div class="text-dark font-weight-bold" style="font-size:15px;"><?= !empty($applicant_name) ? htmlspecialchars($applicant_name) : 'N/A' ?></div>
                                                            <div class="text-muted" style="font-size:12px;">Staff No: <?= !empty($data2[0]['staff_no']) ? htmlspecialchars($data2[0]['staff_no']) : 'N/A' ?></div>
                                                        </div>
                                                        <div class="col-md-6 col-lg-3 mb-2 mb-lg-0">
                                                            <div class="text-muted text-uppercase" style="font-size:11px; letter-spacing:.5px;">College</div>
                                                            <div class="text-dark font-weight-bold" style="font-size:15px;"><?= !empty($data2[0]['college_name']) ? htmlspecialchars($data2[0]['college_name']) : 'N/A' ?></div>
                                                        </div>
                                                        <div class="col-md-6 col-lg-3 mb-2 mb-lg-0">
                                                            <div class="text-muted text-uppercase" style="font-size:11px; letter-spacing:.5px;">Department / Unit</div>
                                                            <div class="text-dark font-weight-bold" style="font-size:15px;"><?= !empty($data2[0]['department_name']) ? htmlspecialchars($data2[0]['department_name']) : 'N/A' ?></div>
                                                        </div>
                                                        <div class="col-md-6 col-lg-3 mb-2 mb-lg-0">
                                                            <div class="text-muted text-uppercase" style="font-size:11px; letter-spacing:.5px;">Present Rank / Position</div>
                                                            <div class="text-dark font-weight-bold" style="font-size:15px;"><?= !empty($data2[0]['present_rank']) ? htmlspecialchars($data2[0]['present_rank']) : 'N/A' ?></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="high_edu" class="text-dark font-weight-bold" style="font-size:15px;"><strong>1. Highest Educational Qualification/Programme:</strong></label>
                                                <input name="high_edu" id="high_edu" class="form-control clcin" value="<?=(!empty($data1[0]['high_edu'])?$data1[0]['high_edu']:'')?>" placeholder="Highest Educational Qualification/Programme">
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>2. Last time study leave was granted, if any(State Programme, Start & End Date):</strong></label>
                                                <input name="study_leave" id="study_leave" class="form-control clcin" value="<?=(!empty($data1[0]['study_leave'])?$data1[0]['study_leave']:'')?>" placeholder="Last time study leave was granted"></input>
                                            </div>
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="int_prog" class="text-dark font-weight-bold" style="font-size:15px;"><strong>3. Intended programme of study</strong></label>
                                                <input name="int_prog" id="inpfm" class="form-control clcin" value="<?=(!empty($data1[0]['int_prog'])?$data1[0]['int_prog']:'')?>" placeholder="Intended programme of study"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_place" class="text-dark font-weight-bold" style="font-size:15px;"><strong>4. Intended place of study</strong></label>
                                                <input name="study_place" id="inpfm" class="form-control clcin" value="<?=(!empty($data1[0]['study_place'])?$data1[0]['study_place']:'')?>" placeholder="Intended place of study"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="date_commence" class="text-dark font-weight-bold" style="font-size:15px;"><strong>5. Date of commencement of programme</strong></label>
                                                <input name="date_commence" id="inpfm2" type="date" value="<?=(!empty($data1[0]['date_commence'])?$data1[0]['date_commence']:'')?>" class="form-control clcin" placeholder="Date of commencement of programme"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="prog_duration" class="text-dark font-weight-bold" style="font-size:15px;"><strong>6. Duration of programme(Years)</strong></label>
                                                <input name="prog_duration" id="study_leave" value="<?=(!empty($data1[0]['prog_duration'])?$data1[0]['prog_duration']:'')?>" class="form-control clcin" placeholder="Duration of programme(Years)"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>7. Type of Programme</strong></label>
                                                <select class="d-block clcin" style="width:100%;" name="prog_type" id="position">
                                                    <option value="<?=(!empty($data1[0]['prog_type'])?$data1[0]['prog_type']:'')?>" ><?=((!empty($data1) && $data1[0]['prog_type'] == 1)?'Full-Time':((!empty($data1) && $data1[0]['prog_type'] == 2)?'Part-Time':'------ Select Type of Programme ------'))?></option>
                                                    <option value="1">Full-Time</option>
                                                    <option value="2">Part-Time</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>8. Mode of Study</strong></label>
                                                <select class="d-block clcin" style="width:100%;" name="study_mode" id="positionstudy_mode">
                                                    <option value="<?=(!empty($data1[0]['study_mode'])?$data1[0]['study_mode']:'')?>" > <?=(!empty($data1[0]['study_mode'])?$data1[0]['study_mode']:'------ Select Mode of Study ------')?></option>
                                                    <option value="REGULAR">REGULAR</option>
                                                    <option value="SANDWICH">SANDWICH</option>
                                                    <option value="WEEKEND">WEEKEND</option>
                                                    <option value="ONLINE">ONLINE</option>
                                                    <option value="EVENING">EVENING</option>
                                                    <option value="OTHERS">OTHERS (PLEASE SPECIFY)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <!-- <div class="col-1">
                                        </div> -->
                                        <div class="col-5" id="other_specfypositionstudy_mode" style="display: none;">
                                            <div class="form-group">
                                                <label for="other_study_mode" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                   8.1. Specify Other Mode of Study
                                                </strong></label>
                                                <input name="other_study_mode" id="study_leave" value="<?=(!empty($data1[0]['other_study_mode'])?$data1[0]['other_study_mode']:'')?>" class="form-control clcin" placeholder="Other scholarship packages obtained"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                   9. Kind of sponsorship required
                                                </strong></label>
                                                <select class="d-block clcin" style="width:100%;" name="sponsor_kind" id="position">
                                                    <option value="<?=(!empty($data1[0]['sponsor_kind'])?$data1[0]['sponsor_kind']:'')?>" ><?=(!empty($data1[0]['sponsor_kind'])?$data1[0]['sponsor_kind']:'------ Kind of sponsorship required ------')?></option>
                                                    <option value="Study leave with pay only">Study leave with pay only</option>
                                                    <option value="Study leave without pay only">Study leave without pay only</option>
                                                    <option value="Study leave with pay and additional packages">Study leave with pay and additional packages</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="other_scholarship" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                   10. Other scholarship packages obtained. If any, Please state the value of the scholarship and other details
                                                </strong></label>
                                                <input name="other_scholarship" id="study_leave" value="<?=(!empty($data1[0]['other_scholarship'])?$data1[0]['other_scholarship']:'')?>" class="form-control clcin" placeholder="Other scholarship packages obtained"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="estimated_fees" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                   10.1. Estimated fees for Year 1 (GHS)
                                                </strong></label>
                                                <input name="estimated_fees" id="inpfm" type="number" step="0.01" min="0" value="<?=(!empty($data1[0]['estimated_fees'])?$data1[0]['estimated_fees']:'')?>" class="form-control clcin" placeholder="Estimated fees for the programme"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="prog_relevance" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                   11. Relevance of programme to department/university (Maximum 100 words)
                                                </strong></label>
                                                <textarea name="prog_relevance" style="width:100%;" id="comment" rows="2" class="form-control" placeholder="Type Relevance of programme to department/university"><?=(!empty($data1[0]['prog_relevance'])?$data1[0]['prog_relevance']:'')?></textarea>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-6">
                                            <hr>
                                            <div class="row">
                                                <div class="col-5">
                                                    <div class="form-group">
                                                        <label for="clcin2" class="text-dark font-weight-bold form-inline" style="font-size:18px;"><strong>Signature Attestation</strong>
                                                            <input name="signed" <?=(!empty($data1[0]['signed'])?'checked':'')?> type="checkbox" id="clcin2" class="form-control clcin2 ml-2 mt-2">
                                                        </label> 
                                                        <p class="text-danger font-weight-bold form-inline">By checking this box, I attest that the information provided is accuarate and true</p>                                               
                                                    </div>
                                                </div>
                                                <div class="col-1">
                                                </div>
                                                <div class="col-5">
                                                    <div class="form-group">
                                                        <label for="sub_date" class="text-dark font-weight-bold form-inline" style="font-size:15px;"><strong>Date</strong></label>
                                                        <input name="sub_date" value="<?=(!empty($data1[0]['sub_date'])?$data1[0]['sub_date']:'')?>" type="date" id="inpfm2" class="form-control clcin">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr>
                                    <div class="row clearfix">
                                        <div class="col-sm-12">
                                            <div class="form-group form-inline">
                                                <label class="text-uppercase font-weight-bold mr-2 text-danger" style="font-size:15px;" for="save">Check this if you want to save and continue your form later
                                                <input type="checkbox" class="form-control text-uppercase ml-3" onclick="showDiv1()" id="save" name="save" placeholder="Position Held">
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-sm-12" id="savecon" style="display: none;">
                                            <div class="form-group">
                                                <div class="text-center"><input type="submit" id="save" name="save" class="btn btn-block font-weight-bold text-white" style="background-color:#273B73; font-size:15px;" value="Save and Continue Later"></div>
                                            </div>
                                        </div>
                                        <div class="col-sm-12" id="send">
                                            <div class="form-group">
                                                <div class="text-center"><input type="submit" id="done" name="done" style="background-color:#D2262D; font-size:15px;" class="btn btn-block font-weight-bold text-white btn-danger" value="Done Submit"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <!--<div class="col-sm-12 col-md-12 col-lg-12">
                                        <button type="submit" class="btn btn-primary btn-block btn-round font-weight-bold h6" name="submit">
                                            Apply <i class="zmdi zmdi-zoomIn"></i></button>
                                    </div>-->
                                    </form>
                                    
                                </div>
                            </div>
                                <!-- <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal</p>
                                <a href="blog-details.html" title="read more" class="btn btn-round btn-info">Read More</a>                         -->
                            </div>
                        </div>                
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<?php }else{ ?>
 <marquee behavior="left" direction="" class="mt-5"><h1> Delaration form opens between 1st August to 30th September</h1></marquee>
<?php } ?>