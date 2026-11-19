  <!-- BEGIN: Footer-->

  <footer class="page-footer footer  footer-static footer-dark gradient-shadow gradient-45deg-indigo-blue navbar-border navbar-shadow">
      <div class="footer-copyright">
          <div class="container"><span>&copy; <?= date('Y') ?> <a href="#" target="_blank">MIS-DICTS</a>, All rights reserved.</span><span class="right hide-on-small-only">Powered by <a href="https://oauth.ucc.edu.gh/">MIS SECTION</a></span></div>
      </div>
  </footer>

  <!-- END: Footer-->
  <!-- BEGIN VENDOR JS-->
  <script src="../../public/js/vendors.min.js"></script>
  <!-- BEGIN VENDOR JS-->
  <!-- BEGIN PAGE VENDOR JS-->
  <script src="../../public/plugins/chartjs/chart.min.js"></script>
  <script src="../../public/plugins/chartist-js/chartist.min.js"></script>
  <script src="../../public/plugins/chartist-js/chartist-plugin-tooltip.js"></script>
  <script src="../../public/plugins/chartist-js/chartist-plugin-fill-donut.min.js"></script>
  <!-- END PAGE VENDOR JS-->
  <!-- BEGIN THEME  JS-->
  <script src="../../public/js/plugins.min.js"></script>
  <script src="../../public/js/search.min.js"></script>
  <script src="../../public/js/custom/custom-script.min.js"></script>
  <script src="../../public/js/scripts/customizer.min.js"></script>
  <!-- END THEME  JS-->
  <!-- BEGIN PAGE LEVEL JS
    <script src="../../public/js/scripts/dashboard-modern.js"></script>-->
  <script src="../../public/js/scripts/intro.min.js"></script>
  <!-- Conditional Pages -->
  <script src="../../public/js/scripts/app-invoice.min.js"></script>
  <script src="../../public/js/scripts/data-tables.min.js"></script>
  <script src="../../public/plugins/data-tables/js/jquery.dataTables.min.js"></script>
  <script src="../../public/plugins/data-tables/extensions/responsive/js/dataTables.responsive.min.js"></script>
  <script src="../../public/plugins/data-tables/js/datatables.checkboxes.min.js"></script>
  <script src="../../public/plugins/data-tables/js/dataTables.select.min.js"></script>
  <script src="../../public/js/scripts/form-select2.min.js"></script>
  <script src="../../public/js/sweetalert2.js"></script>
  <script src="../../public/js/fileinput.js"></script>
  <!-- <script src="../../public/js/pages/charts/jquery-knob.js"></script> -->
  <!-- PDF Viewer -->
  <script src="../../public/vendor/pdfjs/build/pdf.js"></script>
  <script src="../../public/js/init.js"></script>
  <script src="../../public/js/main.js"></script>
  <script src="../../public/js/materialize.min.js"></script>
  <!-- <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js" referrerpolicy="origin"></script> -->
  <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script> -->
  <!-- END PAGE LEVEL JS-->
  <script>
        // CKEDITOR.replace('first_degree_details');
        // CKEDITOR.replace('pg_degree_details');
        // CKEDITOR.replace('other_qualification');
        // CKEDITOR.replace('prizes_grant_award');
        // CKEDITOR.replace('previous_post_duties');
        // CKEDITOR.replace('research_major_projects');
        // CKEDITOR.replace('teaching_duties_experience');
        // CKEDITOR.replace('conference_seminars_etc');
        // CKEDITOR.replace('publications_for_previous_promotion');
        // CKEDITOR.replace('new_publication_submitted');
        // CKEDITOR.replace('professional_membership_bodies');
        // CKEDITOR.replace('other_relevant_info');
        ClassicEditor.create(document.querySelector('#first_degree_details')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#pg_degree_details')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#other_qualification')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#prizes_grant_award')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#previous_post_duties')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#research_major_projects')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#teaching_duties_experience')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#conference_seminars_etc')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#publications_for_previous_promotion')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#new_publication_submitted')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#professional_membership_bodies')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#other_relevant_info')).catch(error => {console.error(error);});

        // This section is for the operational plan
        ClassicEditor.create(document.querySelector('#project_summary_output')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#performance_indicators_output')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#project_summary_outcome')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#performance_indicator_outcome')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#project_summary_impact')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#performance_indicators_impact')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#project_summary_activity')).catch(error => {console.error(error);});
        ClassicEditor.create(document.querySelector('#performance_indicators_activity')).catch(error => {console.error(error);});

    
      function showDiv2() {
          // Get the checkbox
          var checkBox = document.getElementById("save");
          // Get the output text
          //   var text = document.getElementById("text");

          // If the checkbox is checked, display the output text
          if (checkBox.checked == true) {
              //  alert('checked');
              // text.style.display = "block";
              var stval = document.getElementById('savecon').style.display = "block";
              var stval = document.getElementById('send').style.display = "none";
          } else {
              //  alert('checked1');    
              var stval = document.getElementById('send').style.display = "block";
              var stval = document.getElementById('savecon').style.display = "none";

          }
      }

      function promo_status(id) {
          var data = id;
          jQuery.ajax({
              url: "modal_status",
              method: "post",
              data: "promo_id=" + data + ',' + '0',
              success: function(data) {
                  jQuery('body').append(data);
                  jQuery('.status_modal').modal('toggle');
              },
              error: function() {
                  alert("Something went wrong");
              }
          });
      }

      function promo_statusunit(id) {
          var data = id;
          jQuery.ajax({
              url: "modal_status",
              method: "post",
              data: "promo_id=" + data + ',' + '4',
              success: function(data) {
                  jQuery('body').append(data);
                  jQuery('.status_modal').modal('toggle');
              },
              error: function() {
                  alert("Something went wrong");
              }
          });
      }


      $(document).ready(function() {
          $('#repmesform').on('submit', function(event) {
              event.preventDefault();
              if ($('#message').val() == '') {
                  Swal.fire({
                      position: 'top-end',
                      type: 'error',
                      title: 'Please Type a Message',
                      showConfirmButton: false,
                      timer: 2000
                  })
              } else {
                  $.ajax({
                      url: "message_reply",
                      method: "POST",
                      data: $('#repmesform').serialize(),
                      success: function(data) {
                          $('#notice').html(data);
                      }
                  });
              }
          });
      });

      function promo_data_del(id) {
          var data = id;
          jQuery.ajax({
              url: "del_file_promo",
              method: "post",
              data: "promo_file=" + data,
              success: function(data) {
                  location.reload();
              },
              error: function() {
                  alert("Something went wrong");
              }
          });
      }


      $(document).ready(function(e) {
          $("[name='feedback']").on('change', function() {
              // alert('Feedback Given Successfully');
              var url = "updatecoun";
              $.ajax({
                  type: "POST",
                  url: url,
                  data: $(".f_feedback").serialize(),
                  success: function(data) {
                      // $(".tnxforate").html(data)
                      // location.reload();
                      alert('Feedback Given Successfully');
                  }
              });
          });
      });

      $(document).ready(function(e) {
          $("[name='feedback_req']").on('change', function() {
              // alert('Feedback Given Successfully');
              var url = "update_service_req";
              $.ajax({
                  type: "POST",
                  url: url,
                  data: $(".req_feedback").serialize(),
                  success: function(data) {
                      // $(".tnxforate").html(data)
                      // location.reload();
                      alert('Feedback Given Successfully');
                  }
              });
          });
      });

      $(document).ready(function() {
          $('#app_form_a').on('submit', function(event) {
              event.preventDefault();
              //   console.log('paw');
              if ($('#supervisor_name').val() == '') {
                  Swal.fire({
                      title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                      html: '<span class="text-danger">Please enter supervisors name</span>',
                      showConfirmButton: false,
                      width: 300,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      timer: 3000
                  });
              } else if (document.getElementById("emp_signed").checked == false) {
                  Swal.fire({
                      title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                      html: '<span class="text-danger">Employee signature should be check</span>',
                      showConfirmButton: false,
                      width: 300,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      timer: 3000
                  });
              } else {
                  Swal.fire({
                      html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                      showConfirmButton: true,
                      showCancelButton: true,
                      width: 500,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      confirmButtonText: 'Yes!'
                  }).then(function(result) {
                      if (result.value) {
                          $.ajax({
                              url: "staff_self_appraisal",
                              method: "POST",
                              data: $('#app_form_a').serialize(),
                              success: function(data) {
                                  console.log(data);
                                  var response = JSON.parse(data);
                                  console.log(response.status);
                                  if (response.status == 'success') {
                                      Swal.fire({
                                          title: 'Success!!!',
                                          html: '<span class="text-success">' +
                                              response.message + '</span>',
                                          showConfirmButton: false,
                                          width: 300,
                                          imageUrl: '../../public/images/logo/logo.png',
                                          imageWidth: 100,
                                          imageHeight: 100,
                                          imageAlt: 'Loading image',
                                          timer: 3000
                                      }).then(function() {
                                          // location.replace("http://localhost:8500/appraisal_a");
                                          location.reload();
                                      });
                                  } else if (response.status == 'error') {
                                      Swal.fire({
                                          title: 'Oooops!!!',
                                          html: '<span class="text-danger">' +
                                              response.message + '</span>',
                                          showConfirmButton: false,
                                          width: 300,
                                          imageUrl: '../../public/images/logo/logo.png',
                                          imageWidth: 100,
                                          imageHeight: 100,
                                          imageAlt: 'Loading image',
                                          timer: 3000
                                      })
                                  }

                              }
                          });
                      }
                  });
              }
          });
      });

      $(document).ready(function() {
          $('#proDelForm').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
              // var file_data = $("#input-folder-3").fileinput();
              // var file_data1 = $('.file-size-info');
              // form_data.append('file', file_data);
              $.ajax({
                  url: "update_procurement",
                  method: "POST",
                  dataType: 'text',
                  cache: false,
                  contentType: false,
                  processData: false,
                  data: form_data,
                  success: function(data) {
                      console.log(data);
                      var response = JSON.parse(data);
                      console.log(response.status);
                      if (response.status == 'success') {
                          Swal.fire({
                              title: 'Success!!!',
                              html: '<span class="text-success">' + response.message +
                                  '</span>',
                              showConfirmButton: false,
                              width: 300,
                              height: 200,
                              imageUrl: '../../public/images/logo/logo.png',
                              imageWidth: 100,
                              imageHeight: 100,
                              imageAlt: 'Custom image',
                              timer: 3000
                          }).then(function() {
                              // location.replace("https://comedigitalize.com");
                              location.reload();
                          });
                          $('#proDelForm')[0].reset();
                          //   $('#sub_form').html(data);
                      } else if (response.status == 'error') {
                          Swal.fire({
                              position: 'top-right',
                              title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                              html: '<span class="text-danger">' + response.message +
                                  '</span>',
                              showConfirmButton: false,
                              width: 300,
                              height: 200,
                              imageUrl: '../../public/images/logo/logo.png',
                              imageWidth: 100,
                              imageHeight: 100,
                              imageAlt: 'Custom image',
                              timer: 3000
                          });
                      }

                  }
              });

          });
      });

      //   document.addEventListener('DOMContentLoaded', function() {
      //       var elems = document.querySelectorAll('.status_modal');
      //       var instances = M.Modal.init(elems, options);
      //   });

      //   // Or with jQuery

      //   $(document).ready(function() {
      //       $('.status_modal').modal();
      //   });

      function procuremodal_view(id) {
          var data = id;
          jQuery.ajax({
              url: "procuremodal_view",
              method: "post",
              data: "promo_id=" + data + ',' + '4',
              success: function(data) {
                  jQuery('body').append(data);
                  //   $('.status_modal').modal('toggle');
                  jQuery('.status_modal').modal('open');
              },
              error: function() {
                  alert("Something went wrong");
              }
          });
      }

      $(document).ready(function() {
          $('#proForm').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
              // var file_data = $("#input-folder-3").fileinput();
              // var file_data1 = $('.file-size-info');
              // form_data.append('file', file_data);
              $.ajax({
                  url: "send_procurement",
                  method: "POST",
                  dataType: 'text',
                  cache: false,
                  contentType: false,
                  processData: false,
                  data: form_data,
                  success: function(data) {
                      console.log(data);
                      var response = JSON.parse(data);
                      console.log(response.status);
                      if (response.status == 'success') {
                          //   Swal.fire({
                          //   title: 'Success!!!',
                          //   html: '<span class="text-success">'+response.message+'</span>',
                          //   showConfirmButton: false,
                          //   width: 300,
                          //   height: 200,
                          //   imageUrl: '../../public/images/logo/logo.png',
                          //   imageWidth: 100,
                          //   imageHeight: 100,
                          //   imageAlt: 'Custom image',
                          //   timer: 3000
                          // }).then(function(){
                          // location.replace("https://comedigitalize.com");
                          location.reload();
                          // });
                          $('#proForm')[0].reset();
                          //   $('#sub_form').html(data);
                      } else if (response.status == 'error') {
                          Swal.fire({
                              position: 'top-right',
                              title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                              html: '<span class="text-danger">Please select position u are applying</span>',
                              showConfirmButton: false,
                              width: 300,
                              height: 200,
                              imageUrl: '../../public/images/logo/logo.png',
                              imageWidth: 100,
                              imageHeight: 100,
                              imageAlt: 'Custom image',
                              timer: 3000
                          });
                      }

                  }
              });

          });
      });

      function showDiv1() {
          // Get the checkbox
          var checkBox = document.getElementById("save");
          // Get the output text
          //   var text = document.getElementById("text");

          // If the checkbox is checked, display the output text
          if (checkBox.checked == true) {
              //  alert('checked');
              // text.style.display = "block";
              var stval = document.getElementById('savecon').style.display = "block";
              var stval = document.getElementById('send').style.display = "none";
          } else {
              //  alert('checked1');    
              var stval = document.getElementById('send').style.display = "block";
              var stval = document.getElementById('savecon').style.display = "none";

          }
      }

      function checkint(evt) {
          var ch = String.fromCharCode(evt.which);

          if (!(/[0-9,.+/]/.test(ch))) {
              $(document).ready(function() {
                  Swal.fire({
                      position: 'top-left',
                      type: 'error',
                      title: 'ALPHABETS ARE NOT ALLOWED',
                      showConfirmButton: false,
                      timer: 2000

                  })
              });
              evt.preventDefault()
          }
      }

      function procure_del(id) {
          var data = id;
          jQuery.ajax({
              url: "del_procurement",
              method: "post",
              data: "procure_id=" + data + ',' + '1',
              success: function(data) {
                  location.reload();
              },
              error: function() {
                  alert("Something went wrong");
              }
          });
      }

      $(document).ready(function() {
          $('#frmFileUpload').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
              var file_data = $("#input-folder-3").fileinput();
              var file_data1 = $('.file-size-info');
              form_data.append('file', file_data);
              Swal.fire({
                  //   position: 'top-right',
                  html: '<span class="text-danger font-weight-bold"> Are you sure you want save?</span>',
                  showConfirmButton: true,
                  showCancelButton: true,
                  width: 500,
                  height: 200,
                  imageUrl: '../../public/images/logo/logo.png',
                  imageWidth: 100,
                  imageHeight: 100,
                  imageAlt: 'Custom image',
                  confirmButtonText: 'Yes!'
                  //   timer: 3000
              }).then(function(result) {
                  if (result.value) {
                      $.ajax({
                          url: "send_promo_sm",
                          method: "POST",
                          dataType: 'text',
                          cache: false,
                          contentType: false,
                          processData: false,
                          data: form_data,
                          success: function(data) {
                              console.log(data);
                              var response = JSON.parse(data);
                              console.log(response.status);
                              if (response.status == 'success') {
                                  Swal.fire({
                                      title: 'Success!!!',
                                      html: '<span class="text-success">' +
                                          response.message + '</span>',
                                      showConfirmButton: false,
                                      width: 300,
                                      height: 200,
                                      imageUrl: '../../public/images/logo/logo.png',
                                      imageWidth: 100,
                                      imageHeight: 100,
                                      imageAlt: 'Custom image',
                                      timer: 3000
                                  }).then(function() {
                                      // location.replace("https://comedigitalize.com");
                                      location.reload();
                                  });
                                  $('#frmFileUpload')[0].reset();
                                  //   $('#sub_form').html(data);
                              } else if (response.status == 'error') {
                                  Swal.fire({
                                      position: 'top-right',
                                      title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                      html: '<span class="text-danger">' +
                                          response.message + '</span>',
                                      showConfirmButton: false,
                                      width: 300,
                                      height: 200,
                                      imageUrl: '../../public/images/logo/logo.png',
                                      imageWidth: 100,
                                      imageHeight: 100,
                                      imageAlt: 'Custom image',
                                      timer: 3000
                                  });
                              }

                          }
                      });
                  }
              });
          });
      });


      $(document).ready(function() {
          $('#frmFileUpload_contract').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
              var file_data = $("#input-folder-3").fileinput();
              var file_data1 = $('.file-size-info');
              form_data.append('file', file_data);
              Swal.fire({
                  //   position: 'top-right',
                  html: '<span class="text-danger font-weight-bold"> Are you sure you want save?</span>',
                  showConfirmButton: true,
                  showCancelButton: true,
                  width: 500,
                  height: 200,
                  imageUrl: '../../public/images/logo/logo.png',
                  imageWidth: 100,
                  imageHeight: 100,
                  imageAlt: 'Custom image',
                  confirmButtonText: 'Yes!'
                  //   timer: 3000
              }).then(function(result) {
                  if (result.value) {
                      $.ajax({
                          url: "send_promo",
                          method: "POST",
                          dataType: 'text',
                          cache: false,
                          contentType: false,
                          processData: false,
                          data: form_data,
                          success: function(data) {
                              console.log(data);
                              var response = JSON.parse(data);
                              console.log(response.status);
                              if (response.status == 'success') {
                                  Swal.fire({
                                      title: 'Success!!!',
                                      html: '<span class="text-success">' +
                                          response.message + '</span>',
                                      showConfirmButton: false,
                                      width: 300,
                                      height: 200,
                                      imageUrl: '../../public/images/logo/logo.png',
                                      imageWidth: 100,
                                      imageHeight: 100,
                                      imageAlt: 'Custom image',
                                      timer: 3000
                                  }).then(function() {
                                      // location.replace("https://comedigitalize.com");
                                      location.reload();
                                  });
                                  $('#frmFileUpload')[0].reset();
                                  //   $('#sub_form').html(data);
                              } else if (response.status == 'error') {
                                  Swal.fire({
                                      position: 'top-right',
                                      title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                      html: '<span class="text-danger">' +
                                          response.message + '</span>',
                                      showConfirmButton: false,
                                      width: 300,
                                      height: 200,
                                      imageUrl: '../../public/images/logo/logo.png',
                                      imageWidth: 100,
                                      imageHeight: 100,
                                      imageAlt: 'Custom image',
                                      timer: 3000
                                  });
                              }

                          }
                      });
                  }
              });
          });
      });


      $(document).ready(function() {
          $('#operational-step-form').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
            //   var file_data = $("#input-folder-3").fileinput();
            //   var file_data1 = $('.file-size-info');
            //   form_data.append('file', file_data);
              if ($('#project_summary').val() == '') {
                  Swal.fire({
                      position: 'top-right',
                      title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                      html: '<span class="text-danger">Please enter project summary</span>',
                      showConfirmButton: false,
                      width: 300,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      timer: 3000
                  });
              } else {
                  Swal.fire({
                      //   position: 'top-right',
                      html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                      showConfirmButton: true,
                      showCancelButton: true,
                      width: 500,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      confirmButtonText: 'Yes!'
                      //   timer: 3000
                  }).then(function(result) {
                      if (result.value) {
                          $.ajax({
                              url: "../update_operational_plan",
                              method: "POST",
                              dataType: 'text',
                              cache: false,
                              contentType: false,
                              processData: false,
                              data: form_data,
                              success: function(data) {
                                  console.log(data);
                                  var response = JSON.parse(data);
                                  console.log(response.status);
                                  if (response.status == 'success') {
                                      Swal.fire({
                                          title: 'Success!!!',
                                          html: '<span class="text-success">' +
                                              response.message + '</span>',
                                          showConfirmButton: false,
                                          width: 300,
                                          height: 200,
                                          imageUrl: '../../public/images/logo/logo.png',
                                          imageWidth: 100,
                                          imageHeight: 100,
                                          imageAlt: 'Custom image',
                                          timer: 3000
                                      }).then(function() {
                                        //    location.replace("http://localhost:8080/opt_plan_table");
                                          location.reload();
                                      });
                                      //$('#operational-step-form')[0].reset();
                                      //   $('#sub_form').html(data);
                                  } else if (response.status == 'error') {
                                      Swal.fire({
                                          position: 'top-right',
                                          title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                          html: '<span class="text-danger">' +
                                              response.message + '</span>',
                                          showConfirmButton: false,
                                          width: 300,
                                          height: 200,
                                          imageUrl: '../../public/images/logo/logo.png',
                                          imageWidth: 100,
                                          imageHeight: 100,
                                          imageAlt: 'Custom image',
                                          timer: 3000
                                      });
                                  }

                              }
                          });
                      }
                  });
              }
          });
        });

        

      $(document).ready(function() {
          $('#multi-step-form').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
            //   var file_data = $("#input-folder-3").fileinput();
            //   var file_data1 = $('.file-size-info');
            //   form_data.append('file', file_data);
              if ($('#project_summary').val() == '') {
                  Swal.fire({
                      position: 'top-right',
                      title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                      html: '<span class="text-danger">Please enter project summary</span>',
                      showConfirmButton: false,
                      width: 300,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      timer: 3000
                  });
              } else {
                  Swal.fire({
                      //   position: 'top-right',
                      html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                      showConfirmButton: true,
                      showCancelButton: true,
                      width: 500,
                      height: 200,
                      imageUrl: '../../public/images/logo/logo.png',
                      imageWidth: 100,
                      imageHeight: 100,
                      imageAlt: 'Custom image',
                      confirmButtonText: 'Yes!'
                      //   timer: 3000
                  }).then(function(result) {
                      if (result.value) {
                          $.ajax({
                              url: "send_operational_plan",
                              method: "POST",
                              dataType: 'text',
                              cache: false,
                              contentType: false,
                              processData: false,
                              data: form_data,
                              success: function(data) {
                                  console.log(data);
                                  var response = JSON.parse(data);
                                  console.log(response.status);
                                  if (response.status == 'success') {
                                      Swal.fire({
                                          title: 'Success!!!',
                                          html: '<span class="text-success">' +
                                              response.message + '</span>',
                                          showConfirmButton: false,
                                          width: 300,
                                          height: 200,
                                          imageUrl: '../../public/images/logo/logo.png',
                                          imageWidth: 100,
                                          imageHeight: 100,
                                          imageAlt: 'Custom image',
                                          timer: 3000
                                      }).then(function() {
                                          // location.replace("https://comedigitalize.com");
                                          location.reload();
                                      });
                                      $('#multi-step-form')[0].reset();
                                      //   $('#sub_form').html(data);
                                  } else if (response.status == 'error') {
                                      Swal.fire({
                                          position: 'top-right',
                                          title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                          html: '<span class="text-danger">' +
                                              response.message + '</span>',
                                          showConfirmButton: false,
                                          width: 300,
                                          height: 200,
                                          imageUrl: '../../public/images/logo/logo.png',
                                          imageWidth: 100,
                                          imageHeight: 100,
                                          imageAlt: 'Custom image',
                                          timer: 3000
                                      });
                                  }

                              }
                          });
                      }
                  });
              }
          });
        });

        
      $(document).ready(function() {
          $('#advisers_report').on('submit', function(event) {
              //   alert("pal");
              event.preventDefault();
              var form_data = new FormData(this);
              $.ajax({
                  url: "advisers_report",
                  method: "POST",
                  dataType: 'text',
                  cache: false,
                  contentType: false,
                  processData: false,
                  data: form_data,
                  success: function(data) {
                      console.log(data);
                      var response = JSON.parse(data);
                      console.log(response.status);
                      if (response.status == 'success') {
                          Swal.fire({
                              title: 'Success!!!',
                              html: '<span class="text-success">' +
                                  response.message + '</span>',
                              showConfirmButton: false,
                              width: 300,
                              height: 200,
                              imageUrl: '../../public/images/logo/logo.png',
                              imageWidth: 100,
                              imageHeight: 100,
                              imageAlt: 'Custom image',
                              timer: 3000
                          }).then(function() {
                              // location.replace("https://comedigitalize.com");
                              location.reload();
                          });
                          $('#advisers_report')[0].reset();
                          //   $('#sub_form').html(data);
                      } else if (response.status == 'error') {
                          Swal.fire({
                              position: 'top-right',
                              title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                              html: '<span class="text-danger">' +
                                  response.message + '</span>',
                              showConfirmButton: false,
                              width: 300,
                              height: 200,
                              imageUrl: '../../public/images/logo/logo.png',
                              imageWidth: 100,
                              imageHeight: 100,
                              imageAlt: 'Custom image',
                              timer: 3000
                          });
                      }

                  }
              });

          });
      });


      $(document).ready(function() {
          $("#input-folder-1").fileinput({
              uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
              hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
          });
      });
      $(document).ready(function() {
          $("#input-folder-2").fileinput({
              uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
              hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
          });
      });
      $(document).ready(function() {
          $("#input-folder-3").fileinput({
              uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
              hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
          });
      });

      $(document).ready(function() {
          $("#input-folder-4").fileinput({
              uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
              hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
          });
      });
  </script>
  </body>

  </html>