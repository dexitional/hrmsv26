      <!-- REQUEST FORM -->
     <?php if(isset($action) && $action == 'applyform') { ?>
      <div class="body text-white">
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center"><strong>PROMOTION APPLICATION</strong> FORM</h5>
      <ul id="issues-collection" class="collection z-depth-1">
         <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4 center-align"><b><?= $type == 2 ? 'INDIVIDUAL REQUEST':'DEPARTMENTAL REQUEST' ?></b></h6></li>
      </ul>            
            <div class="img-post m-b-15">
            <div class="col-lg-12 col-md-12 col-sm-12">
            <form class="mb-5 mt-5" name="frmFileUpload" action="send_promo" method="post">
               <!--<form id="frmFileUpload" method="post">-->
               <input type="hidden" name="apply_type" id="apply_type" value='0'>
               <div>
               <strong>SELECT JOB RANK : </strong>
               <!--<select class="d-block" style="width:100%;" name="position" id="position" >
                     <option value="">- Select rank you are applying -</option>
                     <?php foreach($data as $position):?>
                     <option value="<?php echo $position['id'];?>"><?php echo $position['title'];?></option>
                     <?php endforeach;?>
               </select>-->
               </div>
               <br><br>
               <div class="row">
                <div class="col-md-12 col-sm-12 col-lg-12">
                  <strong>UPLOAD YOUR CV </strong>
                  <!--<label for="input-folder-card3 mt-3">UPLOAD YOUR CV</label><br>-->
                  (<strong class="text-danger"> Files should be in <strong>pdf/jpg/jpeg</strong> format.
                  <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                  </strong>)
                  <div class="file-loading">
                        <input id="input-folder-3" name="input-folder-3" type="file">
                  </div>
                </div>
                <div class="col-md-12 col-sm-12 col-lg-21">
                  <strong>UPLOAD YOUR PAPERS </strong>
                  <!--<label for="input-folder-4 mt-3">UPLOAD YOUR PAPERS</label><br>-->
                  (<strong class="text-danger"> Files should be in <strong>pdf/jpg/jpeg</strong> format.
                  <!-- <strong> SELECT MULTIPLE FILES AT A TIME </strong> -->
                  </strong>)
                  <div class="file-loading">
                        <input id="input-folder-4" name="input-folder-4" type="file">
                  </div>
                </div>
               </div>
               <div class="col-sm-12 col-md-12 col-lg-12">
                     <button type="submit" class="btn btn-primary btn-block btn-round font-weight-bold h6" name="submit">
                        Apply <i class="zmdi zmdi-zoomIn"></i></button>
               </div>
               </form>
               
            </div>
         </div>
      <?php } ?>

     <!-- FEEDBACK FORM -->
     <?php if(isset($action) && $action == 'feedbackform') { ?>
      <h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">SEND FEEDBACK</h5>
      <form class="mb-5 mt-5" name="feedform" action="postassetfbreq" method="post">
        <div class="row">
          <div class="input-field col s12">
            <i class="material-icons prefix">  </i>
            <select name="remark_id">
              <option value="" disabled selected>Choose your option</option>
              <?php 
                 if(count($remark) > 0){
                  foreach($remarks as $r){ ?>
              <option value="<?= $r['remark_id'] ?>"><?= $m['remark']; ?></option>
              <?php }} ?>
            </select>
            <label>FEEDBACK</label>
          </div>

          <div class="input-field col s12">
            <textarea id="comment" name="comment" class="materialize-textarea"></textarea>
            <label for="comment">COMMENT </label>
          </div>


           <div class="card-action pl-0 pr-0 center-align">
                <button class="btn-small waves-effect waves-light light-blue darken-3" id="save-leave"><b>SUBMIT</b></button>
                <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
           </div>
      </form>
    <?php } ?>

     <!-- DETAILS -->
     <?php if(isset($action) && $action == 'detailview') { ?>
 
    <div class="row">
        <div class="col s12 m12 xl12">
          <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
          <ul id="issues-collection" class="collection z-depth-1">
              <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4"><b>REQUEST DETAIL</b></h6></li>
              <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"></h6></li>
              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> ASSIGNED STAFF</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $data['name'] ?></p>
                    </div>
                  </div>
              </li>

              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> PHONE NUMBER</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $data['phone'] ?></p>
                    </div>
                  </div>
              </li>
              <li class="collection-item">
                  <div class="row">
                    <div class="col s12">
                        <p class="collections-title font-weight-600"><strong>#</strong> DATE ASSIGNED</p>
                        <p class="collections-content light-blue-text text-darken-3 font-weight-bolder"><?= $data['date_assigned'] ?></p>
                    </div>
                  </div>
              </li>
            
            
            </ul>
        </div>
    </div>

    <?php } ?>


     <!-- DETAILS -->
     <?php if(isset($action) && $action == 'overview') { ?>

        <div class="row">
            <div class="col s12 m12 xl12">
              <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
              <ul id="issues-collection" class="collection z-depth-1">
                  <li class="collection-item red lighten-5"><h6 class="red-text text-darken-4"><b>REQUEST OVERVIEW</b></h6></li>
                  <li class="collection-item light-blue lighten-5"><h6 class="light-blue-text text-darken-4" style="font-size:15px"></h6></li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> REQUEST ID</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">EBENEZER KWABENA BLAY ACKAH</p>
                        </div>
                      </div>
                  </li>

                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> REQUEST BY</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">EBENEZER KWABENA BLAY ACKAH</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> PHONE NUMBER</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DEPARTMENT</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> WORK DESCRIPTION</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> WORK STATUS</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE SUBMITTED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li><div class="divider"></div></li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> STAFF ASSSIGNED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE ASSSIGNED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE STARTED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>
                  <li class="collection-item">
                      <div class="row">
                        <div class="col s12">
                            <p class="collections-title font-weight-600"><strong>#</strong> DATE COMPLETED</p>
                            <p class="collections-content light-blue-text text-darken-3 font-weight-bolder">JAN 28, 202O</p>
                        </div>
                      </div>
                  </li>

                </ul>
            </div>
        </div>

     <?php } ?>
            
    <script src="../../public/js/main.js"></script>
