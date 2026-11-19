<style>
    select {
        display: block !important;
    }
</style>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">Add Assessor</h5>

<div role="tabpanel" class="tab-pane">

    <section class="gradient-custom-5">
        <form method="POST" class="uploadfileapproval" enctype="multipart/form-data" action="addassessor_new">
            <input type="hidden" name="uid" value="<?= $uid; ?>" id="uid">
            <input type="hidden" name="apply_type" id="apply_type" value='0'>
            <div class="clearfix">
                <div class="row mb-4">
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="fname" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>First Name</strong></label>
                            <input id="fname" name="fname" value="" placeholder="First Name" type="text" class="validate">
                        </div>
                    </div>
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="lname" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>Last Name</strong></label>
                            <input id="lname" name="lname" value="" placeholder="Last Name" type="text" class="validate">
                        </div>
                    </div>
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="phone_no" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>Phone Number</strong></label>
                            <input id="phone_no" name="phone_no" value="" placeholder="Phone Number" type="text" class="validate">
                        </div>
                    </div>
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="email" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>Email</strong></label>
                            <input id="email" name="email" value="" placeholder="Email" type="text" class="validate">
                        </div>
                    </div>
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="country" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>Country</strong></label>
                            <input id="country" name="country" value="" placeholder="Country" type="text" class="validate">
                        </div>
                    </div>
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="city" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>City</strong></label>
                            <input id="city" name="city" value="" placeholder="City" type="text" class="validate">
                        </div>
                    </div>
                    <div class="col m12 col l12 col s12">
                        <div class="input-field">
                            <label for="address" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;"><strong>Address</strong></label>
                            <textarea name="address" id="address" rows="40" col="20" required class="materialize-textarea validate" placeholder="Type a address here..."></textarea>
                        </div>
                    </div>
                    <div class="col s12">
                        <label for="edu_level" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessors Rank:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="edu_level" id="edu_level">
                            <option value="" selected disabled>- Educational Level -</option>
                            <option value="Bachelors">Bachelors</option>
                            <option value="Masters">Masters</option>
                            <option value="Doctorate">Doctorate</option>
                            <option value="Professorship">Professorship</option>
                        </select>
                    </div>

                    <div class="col s12">
                        <label for="curr_institute" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Current Institute:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="curr_institute" id="curr_institute">
                            <option value="" selected disabled>- Current Institute -</option>
                            <option value="University of Ghana">University of Ghana</option>
                            <option value="University of Cape Coast">University of Cape Coast</option>
                            <option value="University of Education">University of Education</option>
                            <option value="University for Development Studies">University for Development Studies</option>
                            <option value="University of Health andallied Sciences">University of Health and allied Sciences</option>
                        </select>
                    </div>

                    <div class="col s12">
                        <label for="area_special" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Area of Speciality:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="area_special" id="area_special">
                            <option value="" selected disabled>- Area of Speciality -</option>
                            <option value="ART & DESIGN">ART & DESIGN</option>
                            <option value="BUSINESS & MANAGEMENT">BUSINESS & MANAGEMENT</option>
                            <option value="COMPUTER & TECHNOLOGY">COMPUTER & TECHNOLOGY</option>
                            <option value="CRIMINAL JUSTICE & LEGAL">CRIMINAL JUSTICE & LEGAL</option>
                            <option value="EDUCATION & TEACHING">EDUCATION & TEACHING</option>
                            <option value="LIBERAL ART & HUMANITIES">LIBERAL ART & HUMANITIES</option>
                            <option value="NURSING & HEALTHCARE">NURSING & HEALTHCARE</option>
                            <option value="PSYCHOLOGY & COUNSELING">PSYCHOLOGY & COUNSELING</option>
                            <option value="SCIENCE & ENGINEERING">SCIENCE & ENGINEERING</option>
                            <option value="TRADES & CAREERS">TRADES & CAREERS</option>
                        </select>
                    </div>

                </div>
            </div>
            <div class="row mb-4">
                <!-- <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                        <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
                            Submit</button>
                    </div> -->
                <div class="col m12 col l12 col s12 mx-auto">
                    <button class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" type="submit" name="approve" id="approve">
                        Submit</button>
                </div>
                <!-- <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                        <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
                            Cancel</button>
                    </div> -->
            </div>

        </form>
</div>
</div>