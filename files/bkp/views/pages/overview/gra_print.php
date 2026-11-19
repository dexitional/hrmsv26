<section class="invoice-list-wrapper section">
<style>
    table, tbody, td,th {
    border: 2px solid;
    padding: 1px 2px !important;
    }
    @page {
    size: A4 landscape;
    }
    @media print{
        table, tbody, td,th {
        border: 2px solid;
        padding: 1px 1px !important;
        } 
        img{
            width: 80px;
            height: 80px;
        }
        *{
            font-size: 10px !important;
        }
        h4, b{
            font-size: 12px !important;
        }
        h4{
            font-size: 14px !important;
            font-weight: bold !important;
        }
    }
</style>
<!-- <div class="container animate fadeRigh"> -->
    <div class="row">
        <div class="col s3 center-align">
        <img src="/public/images/gralogo.png" width="150" height="150" alt="UCC" class="light-logo" />
        <b>GRA</b>
        </div>
        <div class="col s6">
        <h4 class="center-align"> GHANA REVENUE AUTHORITY</h4>
        <h6 class="center-align">DOMESTIC TAX REVENUE DIVISION</h6>
        <h6 class="center-align"><b>EMPLOYEES TAX DEDUCTION FORM (ANNUAL)</b></h6>
        </div>
        <div class="col s3 center-align">
        <img src="/public/images/coatgh.png" width="150" height="150" alt="UCC" class="light-logo" />

        </div>
    

    </div>
    
    <?php if(empty($data_gra)):?>
        <marquee behavior="left" direction=""><h2> No Data Found</h2></marquee>
        <?php else: ?>
            
    <?php 
    foreach($data_gra as $data_gra_yr):
        
        ?>
    <?php endforeach;?>   
    <!-- Employee Information Section -->
     <div class="row">
        <div class="col s9">
            <div class="col s7" >
                <table class="table-sm">
                    <tbody>
                        <tr>
                            <td>Employee Name: <?php echo $data_gra_yr['EmployeeName'] ?><br>
                        
                            Rank or Grade: <?php echo $data_gra_yr['title'] ?><br>
                        
                            Address: <?php echo $data_gra_yr['long_name'] ?></td>
                        </tr>
                        
                    </tbody>
                </table>
            </div>
            <div class="col s5">
            <table class="table-sm">
                    <tbody>
                        <tr>
                            <td>TIN \ GH Card: <?php echo $data_gra_yr['ghana_card_no'] ?></td>    
                        </tr>
                        <tr>
                            <td>Social Security No.: <?php echo $data_gra_yr['SSN'] ?>
                        
                            </td>
                        </tr>
                        <tr>
                            <td>UCC TIN No.: V0010763317
                        
                            </td>
                        </tr>
                        
                    </tbody>
                </table>
            </div>
            <div class="col s12" >
                <table class="table-sm">
                    <tbody>
                        <tr>
                            <td>Name of Employer: UNIVERSITY OF CAPE COAST<br>
                        
                        
                            Address: PMB CAPE COAST</td>
                        </tr>
                        
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="col s3">
        <table class="table-sm">
                <tbody>
                    <tr>
                        <td><small> Employee's Signature
                        OR Right Thumb Print</small> <br><br><br></td>
                    
                       <td> Year Of
                       Assessment: <br><br><br> <br><?php echo $data_gra_yr['TheYear'] ?></td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
        <div class="col s12">
            <table>
                <thead>
                <tr>
                    <th>Month</th>
                    <th>1. Consolidated <br> Basic Salary</th>
                    <th>2. Cash Allowance <br> Non-Consolidated <br>
                    <small> (Specify On Reverse)</small></th>
                    <th>3. Benefits in Kind <br> <small>(Specify On Reverse)</small> </th>
                    <th>4. Gross <br> Remuneration <br> <small>(Add 1 to 3)</small></th>
                    <th>5. Monthly <br> Deductible Relief</th>
                    <th>6. Social Security <br> Relief</th>
                    <th>7. Taxable <br> Emolument <br><small>(Col. 4 less Col. 5 &6)</small></th>
                    <th>8. Tax Deducted</th>
                    <th>9. Income Tax Receipt No. & <br>
                    Date Of Payment</th>
                </tr>
                </thead>
                <tbody>
                <?php $totBasicSalary = 0;
                $totTaxableAllowance = 0;
                $totgross = 0;
                $totTaxRelief = 0;
                $totssr = 0;
                $totTaxable_Emol = 0;
                $totIRSTax = 0;
                foreach($data_gra as $data_gra_yr):
                    $totBasicSalary += $data_gra_yr['BasicSalary'];
                    $totTaxableAllowance += $data_gra_yr['TaxableAllowance'];
                    $totgross += $data_gra_yr['gross'];
                    $totTaxRelief += $data_gra_yr['TaxRelief'];
                    $totssr += $data_gra_yr['ssr'];
                    $totTaxable_Emol += $data_gra_yr['Taxable_Emol'];
                    $totIRSTax += $data_gra_yr['IRSTax'];
                    ?>

                <tr>
                    <td><?php echo  $data_gra_yr['month_name']?></td>
                    <td><?php echo  number_format($data_gra_yr['BasicSalary'],2)?></td>
                    <td><?php echo  number_format($data_gra_yr['TaxableAllowance'],2)?></td>
                    <td><?php echo  number_format(0,2)?></td>
                    <td><?php echo  number_format($data_gra_yr['gross'],2)?></td>
                    <td><?php echo  number_format($data_gra_yr['TaxRelief'],2)?></td>
                    <td><?php echo  number_format($data_gra_yr['ssr'],2)?></td>
                    <td><?php echo  number_format($data_gra_yr['Taxable_Emol'],2)?></td>
                    <td><?php echo  number_format($data_gra_yr['IRSTax'],2)?></td>
                    <td class="center-align"><?php $year = $data_gra_yr['TheYear'];
                    $month = $data_gra_yr['TheMonth'];
                    $date = DateTime::createFromFormat('Y-m', "$year-$month"); 
                    echo $date->format('t-M-Y')?></td>
                </tr>
                <?php endforeach; ?>
                <tfoot>
                <tr>
                    <th>Total</th>
                    <th><?php echo number_format($totBasicSalary,2)?></th>
                    <th><?php echo number_format($totTaxableAllowance,2)?></th>
                    <th><?php echo  number_format(0,2)?></th>
                    <th><?php echo number_format($totgross,2)?></th>
                    <th><?php echo number_format($totTaxRelief,2)?></th>
                    <th><?php echo number_format($totssr,2)?></th>
                    <th><?php echo number_format($totTaxable_Emol,2)?></th>
                    <th><?php echo number_format($totIRSTax,2)?></th>
                    <th></th>
                </tr>
                </tfoot>
                <!-- Add more rows as needed -->
                </tbody>
            </table>
        </div>
        <div class="row center-align">
    <h6>CERTIFICATE</h6>
        <p>
        I certify the entries made above are correct in every detail and that the income tax deducted has been paid to the Ghana Revenue Authority.</p>
        <div class="col s5">.................................................................    20............</div>
        <!-- <div class="col s1"></div> -->
        <div class="col s7">Signature & Stamp of Employer ...........................................................</div>
        <div class="right-align col s12">I.T.Form 51(Supplementary)</div>
   </div>
   <hr>
   <div class="row">
        <div class="col s4">Report Printed On <?php echo date('d-M-Y')?></div>
        <div class="col s4 center-align">Directorate of Finance, UCC</div>
        <div class="col s4 right-align">Page 1 of 1</div>
   </div>
   <hr>
   <div class="row center-align no-print">
        <a class="btn waves-effect waves-light no-print" style="background-color: #dc3545;" href="/gra">Back
          
        </a>
        <button class="btn waves-effect waves-light no-print" onclick="print()">Print
          <i class="material-icons right">print</i>
        </button>
    </div>
</div>
    
  <!-- </div> -->
  <?php endif;?>
  </section>