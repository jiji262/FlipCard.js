FlipCard.js
===========
FlipCard.js implements card filp animation with javascript, css3 and html5. It's fully customizable with either html5 "data-*" attributes or options in javascript. It also supports all modern browsers which including chrome, firefox, safari, opera, and IE7+.

### First, you need have references to flipcard.css, flipcard.js and jquery 1.7+
```javascript
<link rel="stylesheet" type="text/css" href="flipcard.css" />
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>
<script src="flipcard.js"></script>
```
### Second, some HTML markup
```javascript
<div class="card-container">
   <div class="card">
       <div class="front">
           Front
       </div>
       <div class="back">
           Back
       </div>
   </div>
</div>
```
### Last, let's flip it in javascript!
```javascript
//that's it. Very simple and straightforward.
//You can have two ways to customize the flip effect including direction, speed, timingfunction, autoflip and so on
//The first way is to specify an options when calling flip(options) function, see details below
//The second way is to specify "data-" html attributes in html markup
$(".card-container").flip();
Details on options
//you can specify an options when calling flip() function
var options = {
       alwaysOneDirection: 'false', //values: 'true' or 'false', indicates if flipping card always in one direction
       direction: 'lr', //values: 'lr' (left to right), 'tb'(top to bottom), 'rl' and 'bt'
       speed: '500ms', //specify animation duration
       timingfunction: 'ease', //built-in timing function list (see it below) or customized cubic-beizer
       onflipping: function(dir, transDir) //this event will be triggered before animation
       {
           //dir is direction e.g. 'lr', 'tb'
           //transDir means transforming from front to back (value: 'fb') or back to front (value: 'bf')
           console.log("onflipping event"); 
       },
       onflipped: function(dir, transDir) //this event will be triggered after animation
       {
           //dir is direction e.g. 'lr', 'tb'
           //transDir means transforming from front to back (value: 'fb') or back to front (value: 'bf')
           console.log("onflipped event"); 
       }
}
$(".card-container").flip(options);
//or you can specify "data-" html attributes in html markup, e.g.
<div class="card-container" data-direction="lr" data-speed="500ms" data-timingfunction="ease">
   <div class="card">
       <div class="front">
           Front
       </div>
       <div class="back">
           Back
       </div>
   </div>
</div>
```
### How does auto flipping work?
```javascript
//if you want to have auto flip effect, you can do:
var options = {
       autoflip: "true",
       autoflipstart: '500ms', //indicates how long to wait to start this autoflip
       autoflipdelay: '3s', //indicates how long to wait between two consective flips
}
//or you can specify "data-" html attributes in html markup, e.g.
<div class="card-container" data-autoflip="true" data-autoflipstart="500ms" data-autoflipdelay="3s">
   <div class="card">
       <div class="front">
           Front
       </div>
       <div class="back">
           Back
       </div>
   </div>
</div>
```
### Let's say you want to stop auto flip, how can we do that?
```javascript
//stop auto flip. Just give a "stopautoflip" command in flip() function
$(".card-container").flip("stopautoflip")
 ```
Built-in timing function full list##
```javascript

'ease'
'ease-in'
'ease-out'
'ease-in-out'
'linear'
'ease-in-quad'
'ease-in-cubic'
'ease-in-quart'
'ease-in-quint'
'ease-in-sine'
'ease-in-expo'
'ease-in-circ'
'ease-out-quad'
'ease-out-cubic'
'ease-out-quart'
'ease-out-quint'
'ease-out-sine'
'ease-out-expo'
'ease-out-circ'
'ease-in-out-quad'
'ease-in-out-cubic'
'ease-in-out-quart'
'ease-in-out-quint'
'ease-in-out-sine'
'ease-in-out-expo'
'ease-in-out-circ'
```