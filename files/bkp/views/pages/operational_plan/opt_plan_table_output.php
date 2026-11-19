<script src="https://cdn.tailwindcss.com"></script>

<div>
    <h3 class="mt-3"><?php echo $opt[0]['long_name']?></h3>
  <?php
    if (count($opt) > 0) {
        $i = 1;
        foreach ($opt as $opt_plan) {
  ?>
  <div class="w-full bg-white h-fit flex p-4 divide-x mb-1">
    <!-- <section id="id-section" class="w-1/12">
      <span class="text-blue-900">  O<?php //echo $i++; ?></span>
    </section> -->
      <section class="">
   

      <section id="objectives">

        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
        Objectives <?= $i++; ?>
        </section>
        <section id="elements" class="flex gap-2 divide-x  overflow-x-auto">
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
            Project Summary
            </div>
            <div id="content">
            <?= $opt_plan['ps_obj'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
            Performance Indicators
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['pi_obj'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs text-uppercase">
            Link To UCSP
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['ucsp_link'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
            Budget Estimated
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['be_obj'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
            Budget Actual
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['ba_obj'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
            Target Estimated
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['te_obj'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
            Target Actual
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['ta_obj'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
            Risk Assumption
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['risk_assump'] ?>
            </div>
        </div>
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
            Responsibility
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['responsibility'] ?>
            </div>
        </div>
        
        
        <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
            Sources & Means
            </div>
            <div id="content" class="overflow-auto">
            <?= $opt_plan['sources_means'] ?>
            </div>
        </div>
        
        

        

        </section>
        </section>

      <div class="flex">
        <section id="output" class="w-1/2">

          <section id="main_title" class="bg-blue-900 text-blue-50 p-2 text-lg font-bold text-uppercase">
            Output
          </section>
          <section id="elements" class="flex gap-2 divide-x">
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Project Summary
              </div>
              <div id="content">
                <?= $opt_plan['ps_output'] ?>
              </div>
            </div>
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Performance Indicators
              </div>
              <div id="content">
                <?= $opt_plan['pi_output'] ?>
              </div>
            </div>




          </section>

        </section>
        <section id="outcome" class="w-1/2">
          <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
            Outcome
          </section>
          <section id="elements" class="flex gap-2 divide-x">
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Project Summary
              </div>
              <div id="content">
                <?= $opt_plan['ps_outcome'] ?>
              </div>
            </div>
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Performance Indicators
              </div>
              <div id="content">
                <?= $opt_plan['pi_outcome'] ?>
              </div>
            </div>




          </section>
        </section>
      </div>

      <section id="impact">

        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
          Impact
        </section>
        <section id="elements" class="flex gap-2 divide-x">
          <div id="elements-content" class="flex-col p-1 w-1/2">
            <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
              Project Summary
            </div>
            <div id="content">
              <?= $opt_plan['ps_impact'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1 w-1/2">
            <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
              Performance Indicators
            </div>
            <div id="content">
              <?= $opt_plan['pi_obj'] ?>
            </div>
          </div>




        </section>
      </section>
      <section id="activities">

        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
          Activities
        </section>
        <section id="elements" class="flex gap-2 divide-x  overflow-x-auto">
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
              Project Summary
            </div>
            <div id="content">
              <?= $opt_plan['ps_act'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Performance Indicators
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['pi_act'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Budget Estimated
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['be_act'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Budget Actual
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['ba_act'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Target Estimated
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['te_act'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
              Target Actual
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['ta_act'] ?>
            </div>
          </div>
        </section>
      </section>
      <section id="activities">

        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
          Review
        </section>
        <section id="elements" class="flex gap-2 divide-x  overflow-x-auto">
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Status
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['r_status'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
              Opportunities
            </div>
            <div id="content">
              <?= $opt_plan['r_opportunities'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Challenges
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['r_challenges'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Action Taken
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['r_actions_taken'] ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Remarks
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan['r_remarks'] ?>
            </div>
          </div>
          
        </section>
      </section>
    </section>
    <!-- <section class="w-1/12 px-1">

      <a href='opt_plan_table/<?= $opt_plan['id_obj'] ?>'
        class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 right check_list'>
        <i class="material-icons">list</i>
      </a>
    </section> -->
  </div>
  <?php } ?>
  <div class="row clearfix">
        <button class="btn no-print waves-effect btn-block waves-light light-blue darken-3" onclick="print()" title="Print Form">
            Print
        </button>
    </div>
  <?php }else {?>
    <div class="bg-blue-100 shadow mt-2 mb-2 text-blue-900 h-16 flex items-center gap-4 justify-center w-full">
                <p>There are no existing Operational Plans</p>
                <i class="material-icons">error</i>
    </div>
<?php }?>               
                    
</div>