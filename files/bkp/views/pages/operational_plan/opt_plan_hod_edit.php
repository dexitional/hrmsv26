<?php //var_dump($_SESSION['user']); 
?>
<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
<style>
    /* #position {
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
    } */

    .step-content {
            display: none;
        }
        .step-content.active {
            display: block;
        }
</style>
<section class="profile-page">
    <div class="block-header">
        <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 bg-light">
                <h5 class="light-blue-text text-darken-4 mt-5"><?php
                    //var_dump($opt);
                    // echo $college_id = $_SESSION['user']['college_id'];
                    // echo $faculty_id = $_SESSION['user']['faculty_id'];
                    // echo $parent_id = $_SESSION['user']['parent_id'];
                    // echo $short_name = $_SESSION['user']['short_name'];
                    ?>OPERATIONAL PLAN</h5>
                <hr>
            </div>
        </div>
    </div>
    <div id="button-trigger2" class="card card card-default scrollspy">
        <div class="card-content">
            <div class="container">
                <h4 class="card-title"> VIEW OPERATIONAL PLAN FORM</h4>
              
                 <form id="operational-step-form" action="" method="post" name="planform">
                    <!-- Step 1 -->
                    <div class="step-content active" id="step-1">
                        <h5>OBJECTIVES</h5>
                        <div class="input-field">
                            <input id="project_summary" name="project_summary" type="text" class="validate" value="<?= $opt[0]['ps_obj'];  ?>" required>
                            <label for="project_summary">Project Summary *</label>
                        </div>
                        <div class="input-field">
                            <input id="performance_indicators" name="performance_indicators" type="text" class="validate" value="<?= $opt[0]['pi_obj'];  ?>" required>
                            <label for="performance_indicators">Performance Indicators *</label>
                        </div>
                        <div class="input-field">
                            <input id="ucsp_link" name="ucsp_link" type="text" class="validate" value="<?= $opt[0]['ucsp_link'];  ?>" required>
                            <label for="ucsp_link">Link To UCSP *</label>
                        </div>
                        <!-- <div class="input-field">
                            <input id="b_estimated" name="b_estimated" type="number"value="<?= $opt[0]['be_obj'];  ?>" class="validate">
                            <label for="b_estimated">Budget Estimated</label>
                        </div>
                        <div class="input-field">
                            <input id="b_actual" name="b_actual" type="number" value="<?= $opt[0]['ba_obj'];  ?>" class="validate">
                            <label for="b_actual">Budget Actual</label>
                        </div> -->
                        <div class="input-field">
                            <input id="risk_assump" name="risk_assump" type="text" value="<?= $opt[0]['risk_assump'];  ?>" class="validate">
                            <label for="risk_assump">Risk and Assump</label>
                        </div>
                        <div class="input-field">
                            <input id="responsibility" name="responsibility" type="text" value="<?= $opt[0]['responsibility'];  ?>" class="validate">
                            <label for="responsibility">Responsibility</label>
                        </div>
                        <!-- <div class="input-field">
                            <input id="t_estimated" name="t_estimated" type="number" value="<?= $opt[0]['te_obj'];  ?>" class="validate">
                            <label for="t_estimated">Target Estimated</label>
                        </div>
                        <div class="input-field">
                            <input id="t_actual" name="t_actual" type="number" value="<?= $opt[0]['ta_obj'];  ?>" class="validate">
                            <label for="t_actual">Target Actual</label>
                        </div> -->
                        <div class="input-field">
                            <input id="sources_means" name="sources_means" type="text" value="<?= $opt[0]['sources_means'];  ?>" class="validate">
                            <label for="sources_means">Source and Means of Verification</label>
                        </div>
                        <!-- <button type="button" class="btn previous-step waves-effect waves-light lighten-5 text-darken-4 blue blue-text">Previous</button> -->
                        <button type="button" class="btn next-step">Next</button>
                    </div>

                    <!-- Step 2 -->
                    <div class="step-content" id="step-2">
                        <h5>OUTPUT</h5>
                        
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="project_summary_output" class="text-lg">Project Summary *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="project_summary_output"  name="project_summary_output"><?= $opt[0]['ps_output'];  ?></textarea>

                                    </div>
                        </div>
                        
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="performance_indicators_output" class="text-lg">Performance Indicators *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="performance_indicators_output"  name="performance_indicators_output"><?= $opt[0]['pi_output'];  ?></textarea>

                                    </div>
                        </div>
                        <button type="button" class="btn previous-step waves-effect waves-light lighten-5 text-darken-4 blue blue-text">Previous</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div>

                    <!-- Step 3 -->
                    <div class="step-content" id="step-3">
                        <h5>OUTCOME</h5>
                        
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="project_summary_outcome" class="text-lg">Project Summary *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="project_summary_outcome"  name="project_summary_outcome"><?= $opt[0]['ps_outcome'];  ?></textarea>

                                    </div>
                        </div>
                       
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="performance_indicator_outcome" class="text-lg">Performance Indicators *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="performance_indicator_outcome"  name="performance_indicator_outcome"><?= $opt[0]['pi_outcome'];  ?></textarea>

                                    </div>
                        </div>
                        <button type="button" class="btn previous-step waves-effect waves-light lighten-5 text-darken-4 blue blue-text">Previous</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div>

                    <!-- Step 4 -->
                    <div class="step-content" id="step-4">
                        <h5>IMPACT</h5>
                        
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="project_summary_impact" class="text-lg">Project Summary *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="project_summary_impact"  name="project_summary_impact"><?= $opt[0]['ps_impact'];  ?></textarea>

                                    </div>
                        </div>
                       
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="performance_indicators_impact" class="text-lg">Project Summary *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="performance_indicators_impact"  name="performance_indicators_impact"><?= $opt[0]['pi_impact'];  ?></textarea>

                                    </div>
                        </div>
                        
                        <button type="button" class="btn previous-step waves-effect waves-light lighten-5 text-darken-4 blue blue-text">Previous</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div>

                    <!-- Step 5 -->
                    <div class="step-content" id="step-5">
                        <h5>ACTIVITY</h5>
                       
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="project_summary_activity" class="text-lg">Project Summary *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="project_summary_activity"  name="project_summary_activity"><?= $opt[0]['ps_act'];  ?></textarea>

                                    </div>
                        </div>
                        

                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="performance_indicators_activity" class="text-lg">Performance Indicators *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="performance_indicators_activity"  name="performance_indicators_activity"><?= $opt[0]['pi_act'];  ?></textarea>

                                    </div>
                        </div>
                        <div class="input-field">
                            <input id="b_estimated_activity" name="b_estimated_activity" type="number" value="<?= $opt[0]['be_act'];  ?>" class="validate">
                            <label for="b_estimated_activity">Budget Estimated</label>
                        </div>
                        <div class="input-field">
                            <input id="b_actual_activity" name="b_actual_activity" type="number" value="<?= $opt[0]['ba_act'];  ?>" class="validate">
                            <label for="b_actual_activity">Budget Actual</label>
                        </div>
                        <div class="input-field">
                            <input id="t_estimated_activity" name="t_estimated_activity" value="<?= $opt[0]['te_act'];  ?>" type="number" class="validate">
                            <label for="t_estimated_activity">Target Estimated</label>
                        </div>
                        <div class="input-field">
                            <input id="t_actual_activity" name="t_actual_activity" type="number" value="<?= $opt[0]['ta_act'];  ?>" class="validate">
                            <label for="t_actual_activity">Target Actual</label>
                        </div>
                        <!-- HIDDEN ID -->
                         <input type="text" value="<?= $opt[0]['id_obj'];  ?>" name="opt_id" class="hidden">
                        <button type="button" class="btn previous-step waves-effect waves-light lighten-5 text-darken-4 blue blue-text">Previous</button>
                        <button type="button" class="btn next-step">Next</button>
                    </div>

                    <div class="step-content" id="step-5">
                        <h5>REVIEW</h5>
                       
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="opportunities_review" class="text-lg">Opportunities *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="opportunities_review"  name="opportunities_review"><?= $opt[0]['opportunities_review'];  ?></textarea>

                                    </div>
                        </div>
                        

                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="challenges_review" class="text-lg">Challenges *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="challenges_review"  name="challenges_review"><?= $opt[0]['challenges_review'];  ?></textarea>

                                    </div>
                        </div>

                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="action_taken_review" class="text-lg">Action Taken *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="action_taken_review"  name="action_taken_review"><?= $opt[0]['action_taken_review'];  ?></textarea>

                                    </div>
                        </div>
                        <div class="row">
                            <div class="col s12 m12 l12">
                                        <label for="remarks_review" class="text-lg">Remarks *</label>
                                    </div>
                                    <div class="input-field col s12 m12 l12 ">
                                        <textarea id="remarks_review"  name="remarks_review"><?= $opt[0]['remarks_review'];  ?></textarea>

                                    </div>
                        </div>
                        <div class="row">
                            <div class="col s12 m12 l12">
                                <label for="r_status" class="text-lg">Status *</label>
                            </div>
                            <div class="input-field col s12 m12 l12 ">
                                <select name="r_status" id="r_status">
                                    <option value="<?= $opt[0]['r_status']  ?>" disabled selected> <?= (!empty($opt[0]['r_status'])?$opt[0]['r_status']:'Choose your option')  ?></option>
                                    <option value="Not Started">Not Started</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Defered">Defered</option>
                                    <option value="Discontinued">Discontinued</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- HIDDEN ID -->
                         <input type="text" value="<?= $opt[0]['id_obj'];  ?>" name="opt_id" class="hidden">
                        <button type="button" class="btn previous-step waves-effect waves-light lighten-5 text-darken-4 blue blue-text">Previous</button>
                        <button type="submit" class="btn">Submit</button>
                    </div>
                </form>
               
            </div>
        </div>
    </div>
    
</section>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const steps = document.querySelectorAll('.step-content');
        let currentStep = 0;

        const showStep = (index) => {
            steps.forEach((step, i) => {
                step.classList.toggle('active', i === index);
            });
        };

        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', () => {
                if (document.querySelector(`#step-${currentStep + 1} .validate:invalid`)) {
                    M.toast({html: 'Please fill out all required fields correctly.'});
                    return;
                }
                currentStep = Math.min(currentStep + 1, steps.length - 1);
                showStep(currentStep);
            });
        });

        document.querySelectorAll('.previous-step').forEach(button => {
            button.addEventListener('click', () => {
                // if (document.querySelector(`#step-${currentStep - 1} .validate:invalid`)) {
                //     M.toast({html: 'Please fill out all required fields correctly.'});
                //     return;
                // }
                currentStep = Math.min(currentStep - 1, steps.length + 1);
                showStep(currentStep);
            });
        });

        // document.querySelector('#multi-step-form').addEventListener('submit', (e) => {
        //     if (document.querySelector(`#step-${currentStep + 1} .validate:invalid`)) {
        //         e.preventDefault();
        //         M.toast({html: 'Please fill out all required fields correctly.'});
        //         return;
        //     }
        //     e.preventDefault();
        //     // Add form submission logic here
        //     alert('Form submitted!');
        // });

        showStep(currentStep);
    });


 
    </script>