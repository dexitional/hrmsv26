
<?php //var_dump($_SESSION['user']); ?>
<style>
#position {border-style: solid;
  border-color: #d5d5d5;}
#position:hover {background-color: #d5d5d5;}

#quantity {border-style: solid;
  border-color: #d5d5d5;}
#quantity:hover {background-color: #d5d5d5;}

#desc {border-style: solid;
  border-color: #d5d5d5;}
#desc:hover {background-color: #d5d5d5;}
</style>
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 bg-light">
          <h5 class="light-blue-text text-darken-4 mt-5">PROCURE ITEMS HERE</h5>
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
                                    <!-- <form action="<?php //echo URLROOT; ?>/users/send_promo" id="frmFileUpload" method="post"> -->
                                    <form id="proForm" method="post">
                                    <!--<form action="send_promo" method="post" enctype="multipart/form-data">-->
                                    <div class="row">
                                        <div class="col-md-6">
                                            <select class="d-block" style="width:100%;" name="product_type" id="position">
                                                <option value="">----- Select Product -----</option>
                                                <?php foreach($data as $position):?>
                                                <option value="<?php echo $position['id'];?>"><?php echo $position['type_name'];?></option>
                                                <?php endforeach;?>
                                            </select>                                            
                                        </div>
                                        <input type="hidden" name="stage_status" value="1">
                                        <input type="hidden" name="stage" value="1">
                                        <div class="col-md-6">
                                            <button type="submit" class="btn-block btn-round font-weight-bold waves-effect waves-light btn gradient-shadow gradient-45deg-indigo-blue box-shadow-none border-round" name="submit" style="font-size:16px">
                                            A d d  <i class="zmdi zmdi-plus"></i>
                                            </button>
                                        </div>
                                    </div>
                                    </form><br><br>
                                    <?php if(!empty($procure_data)): ?>
                                    <form id="proDelForm" method="post">
                                    <table class="table">
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>Item No.</th>
                                                <th>Product</th>
                                                <th>Description</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <!-- <th>Total Price</th> -->
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                                <?php 
                                                $i = 1;
                                                 foreach ($procure_data as $procure_data): ?>
                                                    <tr>
                                                        <td><?=$i++; ?></td>
                                                        <td><?=$procure_data['type_name']; ?></td>
                                                        <td><textarea placeholder="Description" name="desc[]" value="" id="procdesc"><?=$procure_data['item_desc']; ?></textarea></td>
                                                        <!-- onchange="procure_update1(<?=$procure_data['id']; ?>)" -->
                                                        <td><input type="number" name="quantity[]" id="quantity" value="<?=$procure_data['quantity']; ?>" placeholder="Quantity"></td>
                                                        <td><input type="number" name="u_price[]" id="u_price" value="<?=$procure_data['unit_price']; ?>" placeholder="Unit Price"></td>
                                                        <!-- <td><input type="number" name="t_price[]" id="t_price" value="<?=$procure_data['total_price']; ?>" placeholder="Total Price"></td> -->
                                                        <td>
                                                            <input type="hidden" name="rid" id="rid" value="<?=$procure_data['request_id']; ?>">
                                                            <input type="hidden" name="rbid[]" id="rbid" value="<?=$procure_data['id']; ?>">
                                                            <div class="row">
                                                                <!-- <div class="col-md-6">
                                                                    <button onclick="procure_update(<?=$procure_data['id']; ?>)" class="btn gradient-shadow gradient-45deg-indigo-blue btn-small btn-block btn-round font-weight-bold h6">
                                                                    Update
                                                                    </button>
                                                                </div> -->
                                                                <div class="col-md-12">
                                                                    <button onclick="procure_del(<?=$procure_data['id']; ?>)" class="btn btn-primary btn-block btn-round font-weight-bold h6">
                                                                    Delete
                                                                    </button>
                                                                </div>                                                                
                                                            </div>                                                    
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                        </tbody>
                                    </table><br><br><br>
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="form-group form-inline">
                                                <label class="text-uppercase font-weight-bold mr-2 text-danger" for="save">Check this if you want to save and continue later
                                                <input type="checkbox" class="form-control text-uppercase ml-3" onclick="showDiv1()" id="save" name="save" placeholder="Position Held">
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-sm-12" id="savecon" style="display: none;">
                                            <div class="form-group">
                                                <div class="text-center"><input type="submit" id="save" name="save" class="btn btn-block font-weight-bold gradient-shadow gradient-45deg-indigo-blue box-shadow-none btn-round" value="Save and Continue Later"></div>
                                            </div>
                                        </div>
                                        <div class="col-sm-12" id="send">
                                            <div class="form-group">
                                                <div class="text-center"><input type="submit" id="done" name="done" style="background-color:#D2262D;" class="btn btn-block font-weight-bold text-white btn-danger btn-round" value="Done Submit"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    </form>
                                <?php endif; ?>
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