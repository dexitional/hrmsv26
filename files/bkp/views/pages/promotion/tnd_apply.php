
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
                                    <div class="row">
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="high_edu" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Highest Educational Qualification/Programme:</strong></label>
                                                <input name="high_edu" id="high_edu" class="form-control clcin" value="<?=(!empty($data1[0]['high_edu'])?$data1[0]['high_edu']:'')?>" placeholder="Highest Educational Qualification/Programme">
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Last time study leave was granted, if any(State Programme, Start & End Date):</strong></label>
                                                <input name="study_leave" id="study_leave" class="form-control clcin" value="<?=(!empty($data1[0]['study_leave'])?$data1[0]['study_leave']:'')?>" placeholder="Last time study leave was granted"></input>
                                            </div>
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="int_prog" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Intended programme of study</strong></label>
                                                <input name="int_prog" id="inpfm" class="form-control clcin" value="<?=(!empty($data1[0]['int_prog'])?$data1[0]['int_prog']:'')?>" placeholder="Intended programme of study"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_place" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Intended place of study</strong></label>
                                                <input name="study_place" id="inpfm" class="form-control clcin" value="<?=(!empty($data1[0]['study_place'])?$data1[0]['study_place']:'')?>" placeholder="Intended place of study"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="date_commence" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Date of commencement of programme</strong></label>
                                                <input name="date_commence" id="inpfm2" type="date" value="<?=(!empty($data1[0]['date_commence'])?$data1[0]['date_commence']:'')?>" class="form-control clcin" placeholder="Date of commencement of programme"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="prog_duration" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Duration of programme(Years)</strong></label>
                                                <input name="prog_duration" id="study_leave" value="<?=(!empty($data1[0]['prog_duration'])?$data1[0]['prog_duration']:'')?>" class="form-control clcin" placeholder="Duration of programme(Years)"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type of Programme</strong></label>
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
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Mode of Study</strong></label>
                                                <select class="d-block clcin" style="width:100%;" name="study_mode" id="position">
                                                    <option value="<?=(!empty($data1[0]['study_mode'])?$data1[0]['study_mode']:'')?>" > <?=(!empty($data1[0]['study_mode'])?$data1[0]['study_mode']:'------ Select Mode of Study ------')?></option>
                                                    <option value="REGULAR">REGULAR</option>
                                                    <option value="SANDWICH">SANDWICH</option>
                                                    <option value="WEEKEND DISTANCE">WEEKEND DISTANCE</option>
                                                    <option value="OTHERS">OTHERS (PLEASE SPECIFY)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="study_leave" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                    Kind of sponsorship required
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
                                                    Other scholarship packages obtained. If any, Please state the value of the scholarship and other details
                                                </strong></label>
                                                <input name="other_scholarship" id="study_leave" value="<?=(!empty($data1[0]['other_scholarship'])?$data1[0]['other_scholarship']:'')?>" class="form-control clcin" placeholder="Other scholarship packages obtained"></input>
                                            </div>
                                        </div>
                                        <div class="col-1">
                                        </div>
                                        <div class="col-5">
                                            <div class="form-group">
                                                <label for="prog_relevance" class="text-dark font-weight-bold" style="font-size:15px;"><strong>
                                                    Relevance of programme to department/university (Maximum 100 words)
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
                                                        <label for="clcin2" class="text-dark font-weight-bold form-inline" style="font-size:20px;"><strong>Click Checkbox to Sign</strong>
                                                            <input name="signed" <?=(!empty($data1[0]['signed'])?'checked':'')?> type="checkbox" id="clcin2" class="form-control clcin2 ml-2 mt-2">
                                                        </label>                                                
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
                                                <label class="text-uppercase font-weight-bold mr-2 text-danger" style="font-size:15px;" for="save">Check this if ou want to save and continue your form later
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