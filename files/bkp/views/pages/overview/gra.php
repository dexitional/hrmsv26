<section class="invoice-list-wrapper section">
<div class="container animate fadeRigh">
    <h4 class="center-align">Ghana Revenue Authority Employee Tax Deduction Form <?php if(!empty($_POST['year'])){var_dump($data_gra);}?></h4>

    <div class="card-content pb-1">
        <form class="col s12" action="gra_data" method="post" name="gra_data">
            <div class="row">
                <div class="col s12">
                    <div class="card">
                        <div class="card-content pb-1">
                            <h5>SEARCH FOR GRA DATA</h5>
                            <hr>
                            <input id="staff_no" name="staff_no" required type="hidden"
                                value="<?=$_SESSION['user']['staff_no']?>" class="validate">
                                <div class="row">
                                    <div class="input-field col s6">
                                        <select class="d-block" style="width:100%;" required name="year" id="year">
                                            <option value="" selected disabled>------ Select Academic Year ------</option>
                                            <?php foreach($yeardata as $year):?>
                                            <option value="<?=$year['TheYear']?>"><?=$year['TheYear']?></option>
                                            <?php endforeach;?>                                            
                                        </select>
                                        <label for="year" class="text-uppercase">Academic Year:</label>
                                    </div>

                                    <div class="input-field col s6">
                                    <button class="btn waves-effect waves-light light-blue darken-3 btn-block" id="sub_card_no"><b>SUBMIT</b></button>
                                    </div>
                                </div>
                        </div>
                        <br>
                    </div>
                </div>
            </div>
        </form>
    </div>

  </div>
  </section>