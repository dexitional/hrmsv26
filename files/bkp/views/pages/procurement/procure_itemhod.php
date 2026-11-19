<?php //var_dump($_SESSION['user']); 
?>
<style>
    #position {
        border-style: solid;
        border-color: #d5d5d5;
    }

    #position:hover {
        background-color: #d5d5d5;
    }

    #quantity {
        border-style: solid;
        border-color: #d5d5d5;
    }

    #quantity:hover {
        background-color: #d5d5d5;
    }

    #desc {
        border-style: solid;
        border-color: #d5d5d5;
    }

    #desc:hover {
        background-color: #d5d5d5;
    }
</style>
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 bg-light">
                <h5 class="light-blue-text text-darken-4 mt-5"><?php
                                                                // var_dump($_SESSION['user']);
                                                                // echo $college_id = $_SESSION['user']['college_id'];
                                                                // echo $faculty_id = $_SESSION['user']['faculty_id'];
                                                                // echo $parent_id = $_SESSION['user']['parent_id'];
                                                                // echo $short_name = $_SESSION['user']['short_name'];
                                                                ?>REQUEST FOR PROCUREMENT OF ITEMS</h5>
                <hr>
            </div>
        </div>
    </div>
    <div class="container-fluid">
        <div class="row clearfix">
            <div class="col s12 m12 l12">
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane blog-page active" id="mypost">
                        <div class="card">
                            <div class="body text-white">
                                <div class="img-post m-b-8 text-center">
                                    <!-- <div class="col-lg-12 col-md-12 col-sm-12"> -->
                                    <!-- <form class="col s12" action="" method="post" name="postform" id="frmFileUpload"> -->
                                    <form id="proForm" action="" method="post">
                                        <div class="row">
                                            <div class="input-field col s6">
                                                <select class="d-block" style="width:100%;" name="prod_cat" id="position">
                                                    <option value="">----- Select Product Category -----</option>
                                                    <?php foreach ($catdata as $position) : ?>
                                                        <option value="<?php echo $position['id']; ?>"><?php echo $position['cat_name']; ?></option>
                                                    <?php endforeach; ?>
                                                </select>
                                            </div>
                                            <input type="hidden" name="stage_status" value="1">
                                            <input type="hidden" name="stage" value="1">
                                            <div class="input-field col s6">
                                                <button type="submit" class="btn-block btn-round font-weight-bold waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue box-shadow-none border-round" name="submit" style="font-size:16px">
                                                    ADD ITEM <i class="zmdi zmdi-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </form><br><br>
                                    <?php if (!empty($procure_data)) : ?>
                                        <div class="input-field card col s12">
                                            <form id="proDelForm" method="post">
                                                <table class="table" style="width: 100%;">
                                                    <thead class="thead-dark">
                                                        <tr>
                                                            <th>Item No.</th>
                                                            <th style="width: 20%;">Item Category</th>
                                                            <th style="width: 35%;">Description</th>
                                                            <th>Quantity</th>
                                                            <th>Unit Price</th>
                                                            <!-- <th>Total Price</th> -->
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php
                                                        $i = 1;
                                                        foreach ($procure_data as $procure_data) : ?>
                                                            <tr>
                                                                <td><?= $i++; ?></td>
                                                                <!-- <td><?= $procure_data['type_name']; ?></td> -->
                                                                <td><?= $procure_data['cat_name']; ?></td>
                                                                <td><textarea placeholder="Description" name="desc[]" value="" required id="procdesc"><?= $procure_data['item_desc']; ?></textarea>
                                                                </td>
                                                                <!-- onchange="procure_update1(<?= $procure_data['id']; ?>)" -->
                                                                <td><input type="number" name="quantity[]" id="quantity" required onkeypress="checkint(event)" value="<?= $procure_data['quantity']; ?>" placeholder="Quantity"></td>
                                                                <td><input type="number" name="u_price[]" id="u_price" required onkeypress="checkint(event)" value="<?= $procure_data['unit_price']; ?>" placeholder="Unit Price"></td>
                                                                <!-- <td><input type="number" name="t_price[]" id="t_price" value="<?= $procure_data['total_price']; ?>" placeholder="Total Price"></td> -->
                                                                <td>
                                                                    <input type="hidden" name="rid" id="rid" value="<?= $procure_data['request_id']; ?>">
                                                                    <input type="hidden" name="rbid[]" id="rbid" value="<?= $procure_data['id']; ?>">
                                                                    <div class="row">
                                                                        <div class="col s12">
                                                                            <button onclick="procure_del(<?= $procure_data['id']; ?>)" style="background-color:#D2262D;" title="Delete" class="btn btn-block font-weight-bold btn-round">
                                                                                <i class="material-icons">delete</i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    </tbody>
                                                </table><br><br><br>
                                                <div class="row">
                                                    <div class="col s12 mb-1">
                                                        <div class="switch right">
                                                            <label class="text-uppercase font-weight-bold" for="save">
                                                                Check this if you want to save and continue later
                                                                <input type="checkbox" class="form-control text-uppercase ml-3" onclick="showDiv1()" id="save" name="save" placeholder="Position Held">
                                                                <span class="lever"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <!-- <div class="switch right">
                                                        <label>
                                                            Check this if you want to save and continue later
                                                            <input type="checkbox" class="form-control text-uppercase ml-3" onclick="showDiv1()" id="save" name="save" />
                                                            <span class="lever"></span>
                                                        </label>
                                                    </div>
                                                    <div class="col-sm-12">
                                                        <div class="form-group form-inline">
                                                            <label class="text-uppercase font-weight-bold mr-2 text-danger" for="save">Check this if you want to save and continue later
                                                                <input type="checkbox" class="form-control text-uppercase ml-3" onclick="showDiv1()" id="save" name="save" placeholder="Position Held">
                                                            </label>
                                                        </div>
                                                    </div> -->
                                                    <div class="col s12 mb-2" id="savecon" style="display: none;">
                                                        <div class="form-group">
                                                            <div class="text-center">
                                                                <button class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" id="save" name="save"><b>Save and Continue Later</b></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col s12 mb-2" id="send">
                                                        <div class="form-group">
                                                            <div class="text-center">
                                                                <button class="btn btn-block font-weight-bold text-white btn-success btn-round" style="background-color: #D2262D;" id="done" name="done"><b>Done Submit</b></button>
                                                                <!-- <input type="submit" id="done" name="done" style="background-color:#D2262D;" class="btn btn-block font-weight-bold text-white btn-success btn-round" value="Done Submit"> -->
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </form>
                                        </div>
                                    <?php endif; ?>
                                    <!-- </div> -->
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