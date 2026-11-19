<content>
    <img src="<?= $data[0]['photo'] ?>" class="file_photo"/>
    <h2 class="heading"><?= $title ?> -  <?= $_SESSION['user'] != null ? $_SESSION['user']['staff_no'] : '' ?></h2>              
        <div class="content">
            <a class="marital">STAFF NO   </a>                 
            <a href="javascript:;" class="staff_no"><?= $data[0]['staff_no'] != null ? $data[0]['staff_no'] : '' ?></a>
        
            <table class="table">
                <!-- Personal Information-->
                <tr>
                    <td colspan="2" align="left"><h4 style="margin-bottom:-5px;">LEAVE APPLICATIONS</h4></td>
                    <td align="left"><h4 style="margin-bottom:-5px;"><?= $data[0]['fname'].' '.$data[0]['mname'].' '.$data[0]['lname'] ?></h4></td>
                </tr>
                <tr>
                    <td colspan="3">
                        <table class="table" style="background:pink;color:darkred"> 
                            <tr>
                                <!-- <th>Current Leave Entitlement</th>-->
                                <!--<th>Outstanding Leave/Over Time Days</th>-->
                                <!--<th>Days Already Taken</th>-->
                                <th>Year</th>
                                <th>Type</th>
                                <th>Status</th>                                        
                                <th>Leave Due</th>
                                <th>Approved Days</th>
                                <th>Period (From)</th>
                                <th>Period (To)</th>
                                <th>Resume On</th>
                            </tr> 
                        <?php 
                            if(count($data) > 0){
                              foreach($data as $row){
                        ?>                                  
                            <tr style="background:#f8f9fa">
                                <!--<td><%- data.entitlement  %></td>-->
                                <!--<td>Outstanding Leave/Over Time Days</td>-->
                                <!--<td>Days Already Taken</td>-->
                                <td><?= $row['year'] ?></td>
                                <td><small><?= $row['title'] ?></small></td>
                                <td><small><?= $row['status'] ?></small></td>                                       
                                <td><?= $row['entitlement'] ?></td>
                                <td><?= $row['approved_days'] ?></td>
                                <td><small><?= $row['start'] != null ? strtoupper($row['start']) :''  ?></small></td>
                                <td><small><?= $row['end'] != null ? strtoupper($row['end']) :''  ?></small></td>
                                <td><small><?= $row['resume'] != null ? strtoupper($row['resume']) :''  ?></small></td>
                            </tr>
                        <?php }} ?>
                        </table>
                    </td>                            
                </tr>
                
            </table>
            
        </div>              
</content>