<style>
    select {
        display: block !important;
    }
</style>
<?php //var_dump($assessordata); 
?>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">Add Assessor</h5>

<div role="tabpanel" class="tab-pane">

    <section class="gradient-custom-5">
        <form method="POST" class="uploadfileapproval" enctype="multipart/form-data" action="assessor_assign">
            <input type="hidden" name="pid" value="<?= $sid; ?>" id="sid">
            <input type="hidden" name="apply_type" id="apply_type" value='0'>
            <div class="clearfix">
                <div class="row mb-4">
                    <div class="col s12">
                        <label for="assessor1" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessor 1:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="assessor1" id="assessor1">
                            <option value="" selected disabled>- Assessor 1 -</option>
                            <?php foreach ($assessordata as $pal) : ?>
                                <option>
                                    <?php echo strtoupper($pal['fname'] . ' ' . $pal['lname'] . ' ( ' . $pal['special_area'] . ' - ' . $pal['institution'] . ' )'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col s12">
                        <label for="assessor2" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessor 2:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="assessor2" id="assessor2">
                            <option value="" selected disabled>- Assessor 2 -</option>
                            <?php foreach ($assessordata as $pal) : ?>
                                <option>
                                    <?php echo strtoupper($pal['fname'] . ' ' . $pal['lname'] . ' ( ' . $pal['special_area'] . ' - ' . $pal['institution'] . ' )'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col s12">
                        <label for="assessor3" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessor 3:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="assessor3" id="assessor3">
                            <option value="" selected disabled>- Assessor 3 -</option>
                            <?php foreach ($assessordata as $pal) : ?>
                                <option>
                                    <?php echo strtoupper($pal['fname'] . ' ' . $pal['lname'] . ' ( ' . $pal['special_area'] . ' - ' . $pal['institution'] . ' )'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col s12">
                        <label for="assessor4" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessor 4:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="assessor4" id="assessor4">
                            <option value="" selected disabled>- Assessor 4 -</option>
                            <?php foreach ($assessordata as $pal) : ?>
                                <option>
                                    <?php echo strtoupper($pal['fname'] . ' ' . $pal['lname'] . ' ( ' . $pal['special_area'] . ' - ' . $pal['institution'] . ' )'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col s12">
                        <label for="assessor5" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessor 5:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="assessor5" id="assessor5">
                            <option value="" selected disabled>- Assessor 5 -</option>
                            <?php foreach ($assessordata as $pal) : ?>
                                <option>
                                    <?php echo strtoupper($pal['fname'] . ' ' . $pal['lname'] . ' ( ' . $pal['special_area'] . ' - ' . $pal['institution'] . ' )'); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col s12">
                        <label for="assessor6" class="blue-text text-darken-4 font-weight-bold" style="font-size:15px;">Assessor 6:</label>
                    </div>
                    <div class="input-field col s12">
                        <select class="d-block validate" style="width:100%;" name="assessor6" id="assessor6">
                            <option value="" selected disabled>- Assessor 6 -</option>
                            <?php foreach ($assessordata as $pal) : ?>
                                <option>
                                    <?php echo strtoupper($pal['fname'] . ' ' . $pal['lname'] . ' ( ' . $pal['special_area'] . ' - ' . $pal['institution'] . ' )'); ?>
                                </option>
                            <?php endforeach; ?>
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