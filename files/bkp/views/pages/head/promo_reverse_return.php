<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">Update Application</h5>

<?php
if (!empty($ps1)) {
    foreach ($ps1 as $sqlprocure) {
    }
?>
    <div role="tabpanel" class="tab-pane">

        <section class="gradient-custom-5">
            <p class="light-blue-text text-darken-4"><?= $sqlprocure['fname'] . ' ' . $sqlprocure['mname'] . ' ' . $sqlprocure['lname'] ?></p>
            <form method="POST" class="uploadfileapproval" enctype="multipart/form-data" action="promo_returning_new">
                <input type="hidden" name="promo_id" value="<?= $sid; ?>" id="promo_id">
                <input type="hidden" name="promo_stage" value="<?= $promoid_status; ?>" id="promo_stage">
                <input type="hidden" name="apply_type" id="apply_type" value='0'>
                <div class="clearfix">
                    <div class="row mb-4">
                        <div class="col s12">
                            <a href='/promo_apply_sm' class='btn waves-effect waves-light chip lighten-5 text-darken-2 green blue-text' title="Upload Updated Document(s)">
                                Click to Update Form/CV/Papers</a>
                        </div>
                    </div>
                    <!-- <div class="col m12 col l12 col s12 mb-4">
                        <div class="form-group">
                            <label for="comment" class="text-dark font-weight-bold" style="font-size:15px;"><strong>Type a Comment</strong></label>
                            <textarea name="comment" id="comment" rows="40" col="20" required class="materialize-textarea validate" placeholder="Type a comment here..."></textarea>
                        </div>
                    </div> -->
                    <!-- <div class="col m12 col l12 col s12 mb-4">
                        <label for="input-folder-3" class="text-dark font-weight-bold mt-4" style="font-size:15px;"><strong>Upload Confidential Report</strong></label><br>
                        <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                        <input id="input-folder-3" name="input-folder-3[]" require type="file">
                    </div> -->
                </div>
                <div class="row mb-4">
                    <!-- <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                        <button class="btn btn-primary btn-round btn-block mx-auto" type="submit" name="approve" id="approve">
                            Submit</button>
                    </div> -->
                    <!-- <div class="col m12 col l12 col s12 mx-auto">
                        <button class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" type="submit" name="approve" id="approve">
                            Submit</button>
                    </div> -->
                    <!-- <div class="col-md-6 col-lg-6 col-sm-6 mx-auto">
                        <button class="btn btn-primary btn-round btn-block mx-auto" type="button" data-dismiss="modal" aria-label="Close">
                            Cancel</button>
                    </div> -->
                </div>

            </form>
    </div>
    </div>
<?php }
?>