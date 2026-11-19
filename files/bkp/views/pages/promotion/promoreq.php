  <section class="invoice-list-wrapper section">
          <h5 class="light-blue-text text-darken-4 mt-5">STAFF PROMOTION REQUESTS</h5>
          <?php if(isset($leave)){ ?>
          <b>The Annual leave deduction for your category is <b class="red-text"><?= $leave['deduction']; ?></b> leave days and you are entitled to <b class="light-blue-text text-darken-2"><?= $leave['entitlement']; ?></b> leave days with <b class="<?= $leave['balance'] > 0 ? 'text-success' :'' ?>"><u><?= $leave['balance'] > 0 ? $leave['balance'] :'no' ?></u></b> outstanding Annual leave balance. You have used <b class="red-text"><?= $leave['used'] ?></b> days of your total annual leave entitlement, so your annual leave days due for the rest of the year are <b class="green-text"><?= $leave['due'] ?></b> days.</b>
          <hr>
          <?php } ?>
                        
    <div class="responsive-table">
      <div id="DataTables_Table_0_wrapper" >
          <div class="top display-flex  mb-2">
              <div class="action-filters">
                  <div id="DataTables_Table_0_filter">    
                      <label>
                        <div class="filter-btn">
                            <?php if($flag['flag_leave_lock'] == 0 && $flag['flag_leave'] == 0){?>
                              <a class="btn waves-effect waves-light red darken-4 border-round" id="leave_apply" data-sno="<?= $_SESSION['user']['staff_no']?>"><b class=""> APPLY LEAVE</b></a>
                            <?php }else if($flag['flag_leave_lock'] == 1 && $flag['flag_leave'] == 0){ ?>
                              <b class="btn blue border-round" id="leave_status"> YOU'VE AN ACTIVE LEAVE REQUEST !</b>
                            <?php } else if($flag['flag_leave_lock'] == 1 && $flag['flag_leave'] == 2){ ?>
                              <b class="btn amber darken-1 black-text text-lighten-4 border-round" id="leave_status"> YOU'RE ON RELIEF DUTIES !</b>
                            <?php } else if($flag['flag_leave_lock'] == 1 && $flag['flag_leave'] == 1){ ?>
                              <b class="btn green border-round" id="leave_status"> YOU'RE ON LEAVE !</b>
                            <?php } ?>
                          </div>
                      </label>
                  </div>
              </div>
      
    
    
    
  </div>
  </div>
    
    <div class="clear"></div>
    
    
    <table class="table invoice-data-table white border-radius-4 pt-1 dataTable dtr-column" id="DataTables_Table_0" role="grid">
        <thead>
          <tr role="row">
              <th></th>
              <th></th>
              <th><span>TYPE</span></th>
              <th>STATUS</th>
              <th>PERIOD</th>
              <th>RESUMPTION</th>
              <th>ENTITLEMENT</th>
              <th>APPROVED</th>
              <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <?php 
            if(count($data) > 0){
                foreach($data as $row){
          ?>
          <tr>
            <td style="display: none;"></td>
            <td></td>
            <td>
                <b class="light-blue-text text-darken-4"><?= $row['title']; ?></b><br>
                <small><em><?= $row['applied_date']; ?></em></small>
            </td>
            <td><small class="chip lighten-5 text-darken-2 <?= $row['status'] == 'GRANTED' ? 'green green-text ':($row['status'] == 'HR-PENDING' ? 'amber darken-1 black-text':'blue blue-text'); ?>"><b><?= $row['status']; ?></b></small></td>
            <td>
              <small class="green-text">START : <b><?= strtoupper($row['start']); ?></b></small><br> 
              <small class="red-text">END : <b><?= strtoupper($row['end']); ?></b></small>
            </td>
            <td><small><b><?= strtoupper($row['resume']); ?></b></small></td>
            <td>
              <span class="bullet cyan"></span>
              <span><b><?= $row['entitlement']; ?></b> <small><em>DAYS</em></small></span>
            </td>
            <td>
              <span class="bullet amber"></span>
              <span><b><?= $row['approved_days']; ?></b> <small><em>DAYS</em></small></span>
            </td>
            <td>
              <div class="invoice-action">
                  <a href="leaveformrep/<?= $row['lid']; ?>" target="_blank" class="invoice-action-view mr-5">
                    <i class="material-icons">remove_red_eye</i>
                  </a>
                <?php if($row['status'] == 'HEAD-PENDING' || $row['status'] == 'STAFF-PENDING'){ ?>
                    <a data-id="<?= $row['lid']; ?>" class="invoice-action-view mr-5">
                      <i class="material-icons">edit</i>
                    </a>
                <?php } ?>
                <?php if($row['status'] == 'HEAD-PENDING' || $row['status'] == 'STAFF-PENDING'){ ?>
                    <a href="delleave/<?= $row['lid']; ?>" onclick="return confirm('Delete leave record?')" class="invoice-action-view mr-4">
                      <i class="material-icons red-text text-lighten-3">delete</i>
                    </a>
                <?php } ?>
              </div>
            </td>
          </tr>
          <?php 
                }}
          ?>
        
        </tbody>
      </table>
  </div>
    </div>
  </section>
