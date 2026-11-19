<?php if (!empty($_SESSION['slim.flash'])): ?>
<script>
document.addEventListener('DOMContentLoaded', function () {

    <?php if (!empty($_SESSION['slim.flash']['success'])): ?>
        M.toast({
            html: '<?= addslashes($_SESSION['slim.flash']['success']); ?>',
            classes: 'green darken-2 white-text',
            displayLength: 4000
        });
    <?php endif; ?>

    <?php if (!empty($_SESSION['slim.flash']['error'])): ?>
        M.toast({
            html: '<?= addslashes($_SESSION['slim.flash']['error']); ?>',
            classes: 'red darken-2 white-text',
            displayLength: 5000
        });
    <?php endif; ?>

});
</script>
<?php endif; ?>
<!-- Staff Profile -->
<div class="row vertical-modern-dashboard">
    <div class="col s12 m12 l12 mt-1">
        <div class="animate fadeRight">
            <div>
                <?php if(!empty($couns_list)):?>
                <div class="row">
                    <div class="col s12">
                        <div class="card">
                            <div class="card-content pb-1">
                                <h5>SERVICE REQUEST(S) <br><br> <?php //var_dump($couns_list);?></h5>

                                <table class="table invoice-data-table white border-radius-4 pt-1 dataTable" id="DataTables_Table_req" role="grid">
                                    <thead>
                                    <tr role="row">
                                        <th>No.</th>
                                        <!-- <th><span>SERVICE TYPE</span></th> -->
                                        <!-- <th>PHONE NUMBER</th> -->
                                        <th>DESCRIPTION</th>
                                        <!-- <th>DELIVERY MODE</th> -->
                                        <th>STATUS</th>
                                        <th>ACTIONS TAKEN</th>
                                        <th>COMMENTS</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <?php 
                                        if(count($couns_list) > 0){
                                            $i=1;
                                            foreach($couns_list as $row){
                                    ?>
                                    <tr>
                                        <td><a href="#" class="light-blue-text text-darken-3">RID-<?= $row['id'] ?></a></td>
                                        <!-- <td>
                                            <b class="light-blue-text text-darken-4"><?= $row['council_needed']; ?></b>
                                        </td> -->
                                        <!-- <td>
                                            <b><?= $row['phone_no']; ?></b>
                                        </td> -->
                                        <td>
                                            <b><?= $row['email']; ?></b><br>
                                        </td>
                                        <!-- <td>
                                            <b class="green-text text-darken-4"><?= $row['delivery_mode']; ?></b><br>
                                        </td> -->
                                        <td>
                                        <a href="javascript:void(0);" data-pid="<?=$row['id']?>">
                                            <small class="chip lighten-5 text-darken-2 
                                            <?= ($row['status'] == 0 ? 'red red-text ':($row['status'] == 1 ? 'green green-text':($row['status'] == 2 ? 'amber darken-1 black-text':($row['status'] == 3 ? 'black white-text':($row['status'] == 4 ? 'blue blue-text':'amber darken-1 black-text'))))); ?>">
                                            <b><?=($row['status'] == 0?'Pending':($row['status'] == 1?'Assigned':($row['status'] == 2?'Assigned':($row['status'] == 3?'Support Started':($row['status'] == 4?'Completed':''))))); ?></b>
                                            </small>
                                        </a>
                                        </td>

                                        <td>
                                        <a href="javascript:void(0);" class="service_request btn waves-effect waves-light light-blue darken-3" data-pid="<?=$row['id']?>">
                                            View Actions
                                        </a>
                                        </td>
                                        
                                        <td>
                                            <a href="javascript:void(0);" class="service_request_staff_feedback btn waves-effect waves-light gradient-45deg-indigo-blue" data-pid="<?=$row['id']?>">
                                                GIVE COMMENT
                                            </a>
                                            <?php if($row['status'] > 3):?>
                                            <form action="" method="POST" class="req_feedback">
                                                <!-- <input type="text" value="" name="fid"> -->
                                            <div class="input-field col s12">
                                                <select class="d-block" style="width:100%;" required name="feedback_req" id="feedback_req">
                                                    <option value="" selected disabled>------ Select Feedback ------</option>
                                                    <option <?php if($row['feedback'] == "VERY SATISFIED"){ echo "selected"; } ?> value="VERY SATISFIED_<?=$row['id']?>">VERY SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "SATISFIED"){ echo "selected"; } ?> value="SATISFIED_<?=$row['id']?>">SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "SIGHTLY SATISFIED"){ echo "selected"; } ?> value="SIGHTLY SATISFIED_<?=$row['id']?>">SIGHTLY SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "NOT SATISFIED"){ echo "selected"; } ?> value="NOT SATISFIED_<?=$row['id']?>">NOT SATISFIED</option>
                                                    <option <?php if($row['feedback'] == "NOT ATTENDED TO"){ echo "selected"; } ?> value="NOT ATTENDED TO_<?=$row['id']?>">NOT ATTENDED TO</option>
                                                </select>
                                                <label for="feedback" class="text-uppercase">Give us Feedback:</label>
                                            </div>
                                            </form>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <?php 
                                            }}
                                    ?>
                                    
                                    </tbody>
                                </table>
                            </div>
                            <br><br>

                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

</div>