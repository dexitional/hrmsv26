
<?php
// var_dump($ps20);die();
if (!empty($ps20)) {
    foreach ($ps20 as $sqlprocure) {
    }
?>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">GIVE COMMENT RID - <?= $sqlprocure['service_id']; ?></h5>
    <div role="tabpanel" class="tab-pane">

        <section class="gradient-custom-5">
            <p class="light-blue-text text-darken-4"></p>
            <form method="POST" class="uploadfileapproval" enctype="multipart/form-data" action="request_status_feedback">
                <input type="hidden" name="service_id" value="<?= $sqlprocure['service_id']; ?>" id="service_id">
                <input type="hidden" name="state" value="0" id="state">
                
                <!-- <input type="hidden" name="apply_type" id="apply_type" value='0'> -->
                <div class="clearfix">
                    <!-- <div class="row mb-4">
                        <div class="switch right col s6">
                            <label>
                                <span style="font-size:15px;" class="pink-text text-darken-4">Disapprove</span>
                                <input type="checkbox" value="2" name="radio" id="radio2" />
                                <span class="lever"></span>
                            </label>
                        </div>
                        <div class="switch right col s6">
                            <label>
                                <span style="font-size:15px;" class="light-green-text text-darken-4">Approve</span>
                                <input type="checkbox" value="1" name="radio" id="radio1" />
                                <span class="lever"></span>
                            </label>
                        </div>
                    </div> -->
                    <div class="col m12 col l12 col s12 mb-4">
                        <div class="form-group">
                            <label for="comment" class="text-dark font-weight-bold"><strong>Type a Comment</strong></label>
                            <textarea name="comment" id="comment" rows="40" col="20" required style="min-height:300px; width:100%; border: 1px solid;" class="materialize-textarea validate" placeholder="Type a comment here..."></textarea>
                        </div>
                    </div>
                    <!-- <div class="col m12 col l12 col s12 mb-4">
                        <label for="input-folder-3" class="text-dark font-weight-bold mt-4" style="font-size:15px;"><strong>Upload Confidential and Commitees Report (Combined in one file) </strong></label><br>
                        <small class="text-danger">File should be in <strong>pdf/image</strong> format</small>
                        <input id="input-folder-3" name="input-folder-3[]" type="file">
                    </div> -->
                </div><br><br>
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
<?php }
?>