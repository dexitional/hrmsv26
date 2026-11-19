  <!-- BEGIN: Footer-->

  <footer class="page-footer footer footer-static footer-dark gradient-shadow gradient-45deg-indigo-blue navbar-border navbar-shadow">
      <div class="footer-copyright">
          <div class="container"><span>&copy; <?= date('Y') ?> <a href="#" target="_blank">MIS-DICTS</a>, All rights reserved.</span><span class="right hide-on-small-only">Powered by <a href="https://oauth.ucc.edu.gh/">MIS SECTION</a></span></div>
      </div>
  </footer>

  <!-- END: Footer-->
  <!-- BEGIN VENDOR JS-->
  <script src="public/js/vendors.min.js"></script>
  <!-- BEGIN VENDOR JS-->
  <!-- BEGIN PAGE VENDOR JS-->
  <script src="public/plugins/chartjs/chart.min.js"></script>
  <script src="public/plugins/chartist-js/chartist.min.js"></script>
  <script src="public/plugins/chartist-js/chartist-plugin-tooltip.js"></script>
  <script src="public/plugins/chartist-js/chartist-plugin-fill-donut.min.js"></script>
  <!-- END PAGE VENDOR JS-->
  <!-- BEGIN THEME  JS-->
  <script src="public/js/plugins.min.js"></script>
  <script src="public/js/search.min.js"></script>
  <script src="public/js/custom/custom-script.min.js"></script>
  <script src="public/js/scripts/customizer.min.js"></script>
  <!-- END THEME  JS-->
  <!-- BEGIN PAGE LEVEL JS
    <script src="public/js/scripts/dashboard-modern.js"></script>-->
  <script src="public/js/scripts/intro.min.js"></script>
  <!-- Conditional Pages -->
  <script src="public/js/scripts/app-invoice.min.js"></script>
  <script src="public/js/scripts/data-tables.min.js"></script>
  <script src="public/plugins/data-tables/js/jquery.dataTables.min.js"></script>
  <script src="public/plugins/data-tables/extensions/responsive/js/dataTables.responsive.min.js"></script>
  <script src="public/plugins/data-tables/js/datatables.checkboxes.min.js"></script>
  <script src="public/plugins/data-tables/js/dataTables.select.min.js"></script>
  <script src="public/js/scripts/form-select2.min.js"></script>
  <script src="public/js/sweetalert2.js"></script>
  <script src="public/js/fileinput.js"></script>
  <!-- PDF Viewer -->
  <script src="public/vendor/pdfjs/build/pdf.js"></script>
  <script src="public/js/init.js"></script>
  <script src="public/js/main.js"></script>

  <!-- END PAGE LEVEL JS-->
  <script>
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

      $(document).ready(function() {
          $('#frmFileUpload').on('submit', function(event) {
              event.preventDefault();
              var form_data = new FormData(this);
              var file_data = $("#input-folder-3").fileinput();
              var file_data1 = $('.file-size-info');
              form_data.append('file', file_data);
              if ($('#position').val() == '') {
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
              } else {
                  Swal.fire({
                      //   position: 'top-right',
                      html: '<span class="text-danger font-weight-bold"> Are you sure you want to apply?</span>',
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
              }
          });
      });


      // $(document).ready(function() {
      //     $("#input-folder-1").fileinput({
      //         uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
      //         hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
      //     });
      // });
      // $(document).ready(function() {
      //     $("#input-folder-2").fileinput({
      //         uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
      //         hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
      //     });
      // });
      // $(document).ready(function() {
      //     $("#input-folder-3").fileinput({
      //         uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
      //         hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
      //     });
      // });

      // $(document).ready(function() {
      //     $("#input-folder-4").fileinput({
      //         uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
      //         hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
      //     });
      // });
  </script>
  </body>

  </html>