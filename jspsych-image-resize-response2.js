/**
* jspsych-image-resize-response
* Eline Van Geert
*
* plugin to display a resizable image and records the resize response 
*
* Based on the jspsych-resize plugin by Steve Chao
*
**/

jsPsych.plugins["image-resize-response2"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'image-resize-response2',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The source for the stimulus image to be resized.'
      },
      stim_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus height',
        default: 1,
        description: 'The height of the stimulus to be resized in pixels.'
      },
      stim_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus width',
        default: 1,
        description: 'The width of the stimulus to be resized in pixels.'
      },
      fixed_aspectratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Fixed aspect ratio',
        default: false,
        description: 'If true, then aspect ratio will be fixed during resizing.'
      },  
      example: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Example',
        default: null,
        description: 'The source for the example image.'
      },
      example_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Example height',
        default: 1,
        description: 'The height of the example image in pixels.'
      },
      example_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Example width',
        default: 1,
        description: 'The width of the example image in pixels.'
      },   
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'The content displayed below the resizable stimulus and above the button.'
      },
      reset_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Reset label',
        default:  null,
        description: 'If not null, a button with this label will be displayed to function as a reset button for the resizing of the image.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'Label to display on the button to complete calibration.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {
  
    var max_height = Math.max(trial.example_height, trial.stim_height);
    var max_width = Math.max(trial.example_width, trial.stim_width);
    var start_height = trial.stim_height;
    var start_width = trial.stim_width;
    var aspect_ratio = trial.stim_width/trial.stim_height;
    
    var stim_position;
    var html = "";
      
      
    if (trial.example !== null){
         // create html for example
        html += '<div  style = "width: '+ trial.example_width +'px; height: '+ trial.example_height +'px; position: absolute; top: 35%; left: 35%; transform: translate(-50%, -50%); ">'+'<img style="height: 100%; width:100%;" src = '+trial.example+'>';
        html += '</div>';    
        
        stim_position = 65;
    } else {
        stim_position = 50;
    }
      
    // create html for display    
    //html +='<div id="jspsych-image-resize-response-div" style="height: '+trial.stim_height+'px; width:'+trial.stim_width+'px; position: absolute; top: 35%; left: '+ stim_position +'%; transform: translate(-50%, -50%);">'+'<img style="height: 100%; width: 100%;" src = '+trial.stimulus+'>';
   html +='<div id="jspsych-image-resize-response-div" style="height: '+trial.stim_height+'px; width:'+trial.stim_width+'px; position: absolute; top: 35%; left: '+ stim_position +'%; transform: rotate(0deg);">'+'<img style="height: 100%; width: 100%;" src = '+trial.stimulus+'>';
//html += '<div id="arrow">&gt;</div>';
//html += '<div id="arrow" style="position: relative; top: -50px"><img src="img/stick.png" height="150" width="20"></div>'; //rotate the image

//html += '<div id="jspsych-image-resize-response-handle" style="cursor: move; background-color: red; width: 10px; height: 10px; border: 2px solid lightsteelblue; position: absolute; bottom: 0; right: 0; "></div>';
html += '<div id="jspsych-image-resize-response-handle" style="cursor: move; background-color: red; width: 15px; height: 150px; border: 2px solid black; position: absolute; bottom: 0; right: 0; "></div>';



    html += '</div>';

    html +='<div  style = "width:'+max_width+'px; height: '+max_height+'px; padding-bottom: 100px;  ">';
    html += '</div>';
    if (trial.prompt !== null){
      html += trial.prompt;
    }
    if (trial.reset_label !== null){
      html += '<a class="jspsych-btn" id="jspsych-image-resize-response-resetbtn" style = "margin-right:30px;">'+trial.reset_label+'</a>';
    }
    html += '<a class="jspsych-btn" id="jspsych-image-resize-response-btn">'+trial.button_label+'</a>';

    // render
    display_element.innerHTML = html;
    
    if (trial.reset_label !== null){
        // listens for the click
        document.getElementById("jspsych-image-resize-response-resetbtn").addEventListener('click', function() {
            resetevent();
        });
    }

    // listens for the click
    document.getElementById("jspsych-image-resize-response-btn").addEventListener('click', function() {
      scale();
      end_trial();
    });

    var dragging = false;
    var origin_x, origin_y;
    var cx, cy;

    var mousedownevent = function(e){
      e.preventDefault();
      dragging = true;
      origin_x = e.pageX ;
      origin_y = e.pageY ;
      cx = parseInt(scale_div.style.width);
      cy = parseInt(scale_div.style.height);
    }
    display_element.querySelector('#jspsych-image-resize-response-handle').addEventListener('mousedown', mousedownevent);
//

    var mouseupevent = function(e){
      dragging = false;
    }
    document.addEventListener('mouseup', mouseupevent);

//

    var scale_div = display_element.querySelector('#jspsych-image-resize-response-div');

    var resizeevent = function(e){
      if(dragging){
        var dx = (e.pageX  - origin_x);
        var dy = (e.pageY  - origin_y);
          
        if(trial.fixed_aspectratio == true){
            //scale_div.style.width = Math.round(aspect_ratio * Math.max(20, cy+dy*2)) + "px";
            //scale_div.style.height = Math.round(Math.max(20, cy+dy*2)) + "px";
             
            var radians = Math.atan2(dx, dy) ;
            var degree = (radians * (180 / Math.PI) * -1) + 90;

           // if (degree >=90){
                scale_div.style.transform = 'rotate('+ degree +'deg)';
           //   }

        } else {
            scale_div.style.width = Math.round(Math.max(20, cx+dx*2)) + "px";
            scale_div.style.height = Math.round(Math.max(20, cy+dy*2)) + "px";
        }
      }
    }
    
    var resetevent = function(){

      scale_div.style.width = start_width + "px";
      scale_div.style.height = start_height + "px";

     scale_div.style.transform = 'rotate(0deg)';
    }

    document.addEventListener('mousemove', resizeevent);

//
/*
function MouseRotate(e, elt) {
  var offset = elt.offset();
  var center_x = (offset.left) + (elt.width() / 2);
  var center_y = (offset.top) + (elt.height() / 2);
  var mouse_x = e.pageX;
  var mouse_y = e.pageY;
  var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
  var degree = (radians * (180 / Math.PI) * -1) + 90;
  $(elt).css('-moz-transform', 'rotate(' + degree + 'deg)');
  $(elt).css('-webkit-transform', 'rotate(' + degree + 'deg)');
  $(elt).css('-o-transform', 'rotate(' + degree + 'deg)');
  $(elt).css('-ms-transform', 'rotate(' + degree + 'deg)');
}
*/


/*
function getCenter(element) {
    const {left, top, width, height} = element.getBoundingClientRect();
    return {x: left + width / 2, y: top + height / 2}
}

const arrow = document.querySelector("#arrow");
const arrowCenter = getCenter(arrow);
document.addEventListener("mousemove", ({clientX, clientY}) => {
    const angle = Math.atan2(clientY - arrowCenter.y, clientX - arrowCenter.x);
    arrow.style.transform = `rotate(${angle}rad)`;
});
*/


//
    // scales the stimulus
    var final_height_px, final_width_px;
    function scale() {
      final_width_px = scale_div.offsetWidth;
      final_height_px = scale_div.offsetHeight;
    }


    // function to end trial
    function end_trial() {

      // clear document event listeners
      document.removeEventListener('mousemove', resizeevent);
      document.removeEventListener('mouseup', mouseupevent);

      // clear the screen
      display_element.innerHTML = '';

      // finishes trial

      var trial_data = {
//        stimulus: trial.stimulus,
//        start_height_px: start_height,
//        start_width_px: start_width,
        final_height_px: final_height_px,
        final_width_px: final_width_px
      }
      
//      if (trial.example !== null){
//        trial_data.example = trial.example;
//        trial_data.example_width_px = trial.example_width;
//        trial_data.example_height_px = trial.example_height;
//      }

      jsPsych.finishTrial(trial_data);
    }
  };

  return plugin;
})();
