    <!-- Staff Profile -->
    <div class="row vertical-modern-dashboard ">
        <div class="col s12 m12 l12">
            <div class="card subscriber-list-card animate fadeRight">
                <div class="card-content pb-1">
                   <h4 class="card-title mb-0 brown-text">REQUEST FOR SERVICE <i class="material-icons float-right">more_vert</i></h4>
                </div>
                <!--<iframe id="printf" name="printf" src="modules/user/request.php" style="width:100%;min-height:650px;margin:0px auto 10px;border:none;border-top:3px solid brown;transform: scale(1); transform-origin: 0 0;"></iframe>-->
                <div class="row active" id="main-view">
                        <div class="col s12">
                           <ul class="tabs tab-demo z-depth-1">
                              <li class="tab col m3"><a class="active" href="#test1"><b>HOME</a></a></li>
                              <li class="tab col m3"><a href="#test2" class=""><b>INDIVIDUAL REQUESTS</b></a></li>
                              <li class="tab col m3"><a href="#test3" class=""><b>DEPARTMENTAL REQUESTS</b></a></li>
                           </ul>
                        </div>
                        <div class="col s12">
                            <div id="test1" class="col s12 active" style="display: block;">
                              <p class="mt-2 mb-2">
                                 Oat cake oat cake marzipan macaroon fruitcake. Ice cream gummi bears ice cream ice cream
                                 danish jelly beans caramels tootsie roll. Pie macaroon croissant tart cake jelly beans
                                 fruitcake.
                              </p>
                           </div>

                           <div id="test2" class="col s12 invoice-list-wrapper section" style="display: none;"><br></br>
                               <h5 class="light-blue-text text-darken-4 mt-5">INDIVIDUAL REQUESTS</h5>
                               <div class="responsive-table">
                                    <div id="DataTables_Table_0_wrapper" >
                                        <div class="top display-flex  mb-2">
                                            <div class="action-filters">
                                                <div id="DataTables_Table_0_filter">
                                                    <label>
                                                        <div class="filter-btn">
                                                            <a class="btn waves-effect waves-light red darken-4 border-round" id="leave_apply" data-sno="<?= $_SESSION['user']['staff_no']?>">
                                                              <b class=""> APPLY LEAVE</b>
                                                            </a>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="clear"></div>
                                    <table class="table invoice-data-table white border-radius-4 pt-1 dataTable dtr-column" id="DataTables_Table_0" role="grid">
                                    <thead>
                                        <tr role="row">
                                            <th>Request ID</th>
                                            <th>Unit</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                       <!-- 
                                        <tr>
                                        <td style="display: none;"></td>
                                        <td></td>
                                        <td>
                                            <b class="light-blue-text text-darken-4">title</b><br>
                                            <small><em><?= $row['applied_date']; ?></em></small>
                                        </td>
                                        <td><small class="chip lighten-5 text-darken-2 green green-text"><b>Status</b></small></td>
                                        <td>
                                            <small class="green-text">START : <b>2019-01-29</b></small><br> 
                                            <small class="red-text">END : <b>2019-01-29</b></small>
                                        </td>
                                        <td><small><b>2019-01-29</b></small></td>
                                        <td>
                                            <span class="bullet cyan"></span>
                                            <span><b>22</b> <small><em>DAYS</em></small></span>
                                        </td>
                                        <td>
                                            <span class="bullet amber"></span>
                                            <span><b>20</b> <small><em>DAYS</em></small></span>
                                        </td>
                                        <td>
                                            <div class="invoice-action">
                                            <a data-id="12" class="invoice-action-view mr-5">
                                                <i class="material-icons">remove_red_eye</i>
                                            </a>
                                            <a data-id="" class="invoice-action-view mr-5">
                                                <i class="material-icons">edit</i>
                                            </a>
                                            <a href="delleave/12" onclick="return confirm('Delete leave record?')" class="invoice-action-view mr-4">
                                                    <i class="material-icons red-text text-lighten-3">delete</i>
                                            </a>
                                          </div>
                                        </td>
                                        </tr>
                                         -->
                                            <?php 
                                                if(count($ind) > 0){
                                                foreach($ind as $row){
                                            ?>
                                            <tr>
                                                <td><?= $row['request_id'] ?></td>
                                                <td> <span class="bullet cyan"></span><b><?= $row['unit'] ?></b></td>
                                                <td><span><b>20</b> <small><em><?= $row['description'] ?></em></small></span></td>
                                                <td><small class="chip lighten-5 text-darken-2 green green-text"><b><?= strtoupper($row['progress']) ?></b></small></td>
                                                <td><a href='' class='waves-effect waves-light btn gradient-45deg-light-blue-cyan box-shadow-none border-round mr-1 mb-1 right'><b>check</b></a></td>
                                                
                                            </tr>
                                            <?php }} ?>
                                    </tbody>
                                    </table>
                                </div>
                           </div>


                           <div id="test3" class="col s12 section section-data-tables" style="display: none;">
                                <div class="row">
                                                <div class="col s12">
                                            
                                                            <div class="card-content">
                                                            <h4 class="card-title">DEPARTMENTAL REQUESTS</h4>
                                                            <div class="row">
                                                                <div class="col s12">
                                                                <table id="scroll-dynamic" class="display">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Request ID</th>
                                                                            <th>Unit</th>
                                                                            <th>Description</th>
                                                                            <th>Status</th>
                                                                            <th>Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    <?php 
                                                                    if(count($dep) > 0){
                                                                        foreach($dep as $row){
                                                                    ?>
                                                                    <tr>
                                                                        <td><?= $row['request_id'] ?></td>
                                                                        <td><?= $row['unit'] ?></td>
                                                                        <td><?= $row['description'] ?></td>
                                                                        <td><?= $row['progress'] ?></td>
                                                                        <td>2011/04/25</td>
                                                                    
                                                                    </tr>
                                                                    <?php }} ?>
                                                                    </tbody>
                                                                </table>
                                                                </div>
                                                            </div>
                                                            </div>
                                                    
                                                </div>
                                        </div>
                                </div>
                           </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
                                                                       