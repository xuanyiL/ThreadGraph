//GLOBAL

var bar_width = 640;
var draw_node_width = 7;
var draw_node_margin = 4;
var draw_node = draw_node_width*2;
var draw_width =640;
var draw_width2 = draw_width-draw_node;
var draw_height = 60;
var title_flag = 0;
var ref_flag = 0;
var bld_flag = 0;
var ant_flag = 0;
var author_flag = 0;
var draw_pointer = 0;
var time_width = 680;
var tline;
var tlinems;
var rens = [];
var timelineRen = null;
var mstline = null;
var comGraph;
var netGraph;
var published;

var linkByIndexSourceTarget ={};
function drawMap(pub){
  published = pub;
  rens = [];
	cleanUp();
	tline = initTime();
  var format = d3.time.format("%Y-%m-%d %H:%M:%S.%L");
  mstline = [+format.parse(tline[0]), +format.parse(tline[1])];

  // For timeline, a range is required
  if (mstline[0] === mstline[1]) {
    mstline[1] = 1.001 * mstline[0];
  }

	initBar();    //TODO display entire area
	initthread(tline);
  
  //toggleTitlesAll(document.getElementById('toggle-titles'));
  //toggleAuthorsAll(document.getElementById('toggle-authors'));
  $("body").on("selected", markSelectionAll);
}

function markSelectionAll(event) {
  // console.log('highlighting selections ', event.d);
  for(var i = 0; i < rens.length; ++i ) {
    rens[i].select(event.d);
    rens[i].redraw();
  }
}

function initBar(){
	document.getElementById("wrapper").style.visibility="visible";
}

function cleanUp(){
	var root_draw = document.getElementById("draw_area");
	var cnt = root_draw.children.length;
	//clean up
	for (var i = 0;i<cnt;i++){
		root_draw.removeChild(root_draw.children[0]);
	}
	//root_draw = document.getElementById("time_right");
	//cnt = root_draw.children.length;
	//for (var i = 0;i<cnt;i++){
		//root_draw.removeChild(root_draw.children[0]);
	//}
}

//get start and end time
function initTime(){
	var root_raw = document.getElementById("raw_area");
	var firsttime;
	var lasttime;
	var fchildren = root_raw.children;
  //console.log('fchildren',fchildren);
	var flength = fchildren.length;
  // console.log('flength',flength);
	for (var k=0;k<flength;k++){
		var rchildren = fchildren[k].children;
    // console.log('rchildren',rchildren);
		var rlength = rchildren.length;
    // console.log('rlength',rlength);
		for (var i=0;i<rlength;i++){
			var currenttime = rchildren[i].getAttribute("date");
			if (firsttime == null) {
				firsttime = currenttime;
			}
			if (lasttime == null) {
				lasttime =currenttime;
			}
			if (compareDate(firsttime,currenttime) == 1){
				firsttime = currenttime;
			}
			if (compareDate(lasttime,currenttime) == -1){
				lasttime = currenttime;
			}
		}
	}
	//console.log('firsttime',firsttime);
	//console.log('lasttime',lasttime);
	return [firsttime,lasttime];
}

//init time line
function initTLine(e){
	//var root_time = document.getElementById("time_right");
	var split = 10;
	var start = newDT(e[0]);
	var end = newDT(e[1]);
	var starttime = parseDT(e[0]);
	var endtime = parseDT(e[1]);
	var tp = (endtime-starttime)/split;
	//var tnode = document.createElement("div");
	//tnode.setAttribute("class","timenode");
	//tnode.appendChild(document.createTextNode((start.getMonth()+1)+"/"+(start.getDate())+"/"+start.getFullYear()));
	//tnode.style.left="0px";
	//root_time.appendChild(tnode);
	for (var i = 1; i < split; i++){
		var nd = new Date();
		nd.setTime(0-nd.getTime());
		nd.setTime(start);
		var dateoffset = tp*i+starttime;
		nd.setTime(dateoffset);
		//var ttnode = document.createElement("div");
		//ttnode.setAttribute("class","timenode");
		//ttnode.appendChild(document.createTextNode((nd.getMonth()+1)+"/"+(nd.getDate())));
		//ttnode.style.left = bar_width/split*i + 20 + "px";
		//root_time.appendChild(ttnode);
	}
	var enode = document.createElement("div");
	enode.setAttribute("class","timenode");
	enode.appendChild(document.createTextNode((end.getMonth()+1)+"/"+(end.getDate())+"/"+end.getFullYear()));
	enode.style.left=time_width + "px";
	root_time.appendChild(enode);
}

// compare two STRING date
function compareDate(str1,str2){
	var date1 = parseDT(str1);
	var date2 = parseDT(str2);
	var re;
	if ((date1 - date2) > 0 ){
		re = 1;
	}
	else if ((date1 - date2) == 0){
		re = 0;
	}
	else if ((date1 - date2) < 0){
		re = -1;
	}
	return re;
}

// parse date & time
function parseDT(str) {
	// NOTE: Since we can have months like 08 or 09
	// javascript will parse think these as octals 
	// and will return 0. We need to define base 10 explicity
	// to make sure to prevent this bevahior.
	var DT = new Date();	
	DT.setFullYear(parseInt(str.substr(0,4), 10));
	DT.setMonth(parseInt(str.substr(5,2), 10)-1);
	DT.setDate(parseInt(str.substr(8,2), 10));
	DT.setSeconds(parseInt(str.substr(17,2), 10));
	DT.setMinutes(parseInt(str.substr(14,2), 10));
	DT.setHours(parseInt(str.substr(11,2), 10));
	DT.setMilliseconds(000);
	return DT.getTime();
}

function newDT(str){
	str = parseDT(str);
	var DT = new Date();
	DT.setTime(0-DT.getTime());
	DT.setTime(str);
	return DT;
}

function initthread(e){
	var root_draw = document.getElementById("draw_area");
	var root_raw = document.getElementById("raw_area");
	
	var c_draw = document.createElement("div");
  root_draw.appendChild(c_draw);
  c_draw.setAttribute("class", "thread");
  //c_draw.setAttribute("threadfocus", c_raw.getAttribute("focusname"));
  
  var threadTimelineArea = document.createElement('div');
  threadTimelineArea.setAttribute('id', 'threadtimeline_area');
  c_draw.appendChild(threadTimelineArea);


  //init timeline
  if (timelineRen === null) {
    timelineRen = renderer();
    $(comGraph).on("timelineUpdated", function(event) {
      console.log('updated');
      var domain = event.domain;
      $("#slider").slider({ values: [ domain[0], domain[1] ] });    
    });
  }
  var threadTimelineArea = document.getElementById('threadtimeline_area');
  var threadnoteArea = $('.threadnote_area');
  //if (threadnoteArea.length > 0) {
    var left = document.createElement('div');
    $(left).attr('class', 'thread_left');
    $(left).attr('background-color', 'white');
    $(left).css('height', '78px');
    $(left).css('border', 'none');
    
    //create link for full map view
    var ref = document.createElement("a");
    left.appendChild(ref);
    $(left).css('top', '68px');
    ref.setAttribute("href", "#");
    ref.setAttribute("id", "birds_eye");
    ref.appendChild(document.createTextNode("Click To View Full Screen Map"));

    var right = document.createElement('div');
    $(right).attr('class', 'thread_right');
    $(right).css('background-color','#F5F5F5');
    //$(right).css('position', 'relative');
    $(right).css('height', '78px');

    $(threadTimelineArea).append(left);
    $(threadTimelineArea).append(right);

    var rightInner = document.createElement('div');
    $(rightInner).attr('class', 'threadnote_area');
    $(rightInner).css('height', '78px');
    $(rightInner).css('top', '0px');
    $(right).append(rightInner);

    timelineRen.drawTimeline(null, rightInner,  mstline);  
    
 
    
    c_left = document.createElement("div");
    c_left.setAttribute("class","thread_left");
    c_draw.appendChild(c_left);
      
    c_right = document.createElement("div");
    c_right.setAttribute("class","thread_right")
    c_draw.appendChild(c_right);
    
    // TODO move this code somewhere else
    var heightPerGroup = 0;
    
    if (root_raw.children.length > 0) {
      heightPerGroup = parseInt($(c_left).css("height"), 10) / root_raw.children.length;
    }
    
    for (var i = 0;i < root_raw.children.length; ++i){
    var top =  i * heightPerGroup + heightPerGroup * 0.04;
    var height =  heightPerGroup - heightPerGroup * 0.08;
    console.log('height per group',height); 
  //  //init thread left & right
    var c_raw = root_raw.children[i];
  //  var c_draw = document.createElement("div");
  //  root_draw.appendChild(c_draw);
  //  c_draw.setAttribute("class", "thread");
  //  c_draw.setAttribute("threadfocus", c_raw.getAttribute("focusname"));
  
  //  var threadTimelineArea = document.createElement('div');
  //  threadTimelineArea.setAttribute('id', 'threadtimeline_area');
  //  c_draw.appendChild(threadTimelineArea);
  
  //  c_left = document.createElement("div");
  //  c_left.setAttribute("class","thread_left");
  //  c_draw.appendChild(c_left);
  
  //  c_right = document.createElement("div");
  //  c_right.setAttribute("class","thread_right")
  //  c_draw.appendChild(c_right);
  //create a new division as tooltip
    
    
  
    //init thread left
    var thread_div = document.createElement("div");
    $(thread_div).addClass("threadEntity");
    $(thread_div).attr("focusname", c_raw.getAttribute("focusname"));
    $(thread_div).css("top", top.toString() + "px");
    $(thread_div).css("height", height.toString() + "px");
    
    c_left.appendChild(thread_div);
    //var tmpspan = document.createElement("span");
    //var tmpspan = document.createElement("span");
    //tmpspan.appendChild(document.createTextNode(c_raw.getAttribute("focusname")));
    
    
    var ahref = document.createElement("a");
    var hrefText = 
    thread_div.appendChild(ahref);
    if (published === undefined) {
      ahref.setAttribute("href","threadLoad.jsp?database="+_database+"&threadfocus="+c_raw.getAttribute("focusname")+"&projectname="+_projectname);
      hrefText = "<a target=_blank href=threadLoad.jsp?database="+_database+"&threadfocus="+c_raw.getAttribute("focusname").replace(/\s/g,"%20")+"&projectname="+_projectname.replace(/\s/g,"%20")+"><b>Look Into Thread</b></a>"
      +"<br/> <b>"+c_raw.getAttribute("nt_num")+" note(s) by "+ c_raw.getAttribute("au_num")+" author(s)"+"</b> <br/>"+
      "<a target= _blank href=ThreadSum.jsp?threadfocus="+c_raw.getAttribute("focusname").replace(/\s/g,"%20")+"&projectname="+_projectname.replace(/\s/g,"%20")+"&database="+_database+"><b>Journey Of Thinking</b></a>";
    } else {
      ahref.setAttribute("href","ViewPublishedThread.jsp?timestamp="+_timestamp+"&threadfocus="+c_raw.getAttribute("focusname")+"&projectname="+_projectname);
      hrefText = "<a target=_blank href=ViewPublishedThread.jsp?timestamp="+_timestamp.replace(/\s/g,"%20")+"&threadfocus="+c_raw.getAttribute("focusname").replace(/\s/g,"%20")+"&projectname="+_projectname.replace(/\s/g,"%20")+"><b>Look Into Thread</b></a>"
      +"<br/> <b>"+c_raw.getAttribute("nt_num")+" note(s) by "+ c_raw.getAttribute("au_num")+" author(s)"+"</b> <br/>"+
      "<a target= _blank href=ThreadSum.jsp?threadfocus="+c_raw.getAttribute("focusname").replace(/\s/g,"%20")+"&projectname="+_projectname.replace(/\s/g,"%20")+"&database="+_database+"><b>Journey Of Thinking</b></a>"; 
    }
    ahref.setAttribute("target","_blank");
    ahref.appendChild(document.createTextNode(c_raw.getAttribute("focusname")));
    ahref.setAttribute("class","tooltip");
    
    var hover_div = document.createElement("div");
    hover_div.setAttribute("id", "hover_d");
    hover_div.appendChild(document.createTextNode(c_raw.getAttribute("nt_num")+" note(s) by "+ c_raw.getAttribute("au_num")+" author(s)"));
    hover_div.appendChild(document.createElement("br"));
    var aref = document.createElement("a");
    hover_div.appendChild(aref);
    aref.setAttribute("href","ThreadSum.jsp?threadfocus="+c_raw.getAttribute("focusname")+"&projectname="+_projectname+"&database="+_database);
    aref.setAttribute("target","_blank");
    aref.appendChild(document.createTextNode("Journey of Thinking"));
   
 // Q-tip comment box on mouseover
      $(ahref).qtip({
        style: {
          height: 50, width:210
        },
        content: {
            text: hrefText
        },
        hide: {
          fixed: true,
          delay: 300
        }
      });
   
    
    if(height >= 28)
    {
      thread_div.appendChild(document.createElement("br"));
      thread_div.appendChild(document.createTextNode(c_raw.getAttribute("nt_num")+" note(s) by "+ c_raw.getAttribute("au_num")+" author(s)"));
      thread_div.appendChild(document.createElement("br"));
    }
   /* if(height >= 46)
    {
      ahref = document.createElement("a");
      thread_div.appendChild(ahref);
      ahref.setAttribute("href","ThreadSum.jsp?threadfocus="+c_raw.getAttribute("focusname")+"&projectname="+_projectname+"&database="+_database);
      ahref.setAttribute("target","_blank");
      ahref.appendChild(document.createTextNode("Journey of Thinking"));
      //thread_div.appendChild(document.createTextNode(" | "));
      //ahref = document.createElement("a");
      thread_div  .appendChild(document.createTextNode(" "));
      thread_div.appendChild(document.createElement("br"));
    }*/
    //thread_div.appendChild(ahref);
    //ahref.setAttribute("href","threadLoad.jsp?database="+_database+"&threadfocus="+c_raw.getAttribute("focusname")+"&projectname="+_projectname);
    //ahref.setAttribute("target","_blank");
    //ahref.appendChild(document.createTextNode("Look into Thread"));
    
    //init right area
    //drawright(c_raw, c_right);  
     
  }    
  //Bird's eye full screen view 
    $('#birds_eye').on('click', function() {
        var that = this;
        $(this).fadeOut();
        $('#networkGraph_pieChart').hide();
      var top = $('#wrapperu').css('top');
      console.log(top);
      $('#wrapperu').css("top", 0);
      var stickyZIndex = $('#sticky').css("z-index");
      $('#sticky').css("z-index", 0);
      //Full screen view
      var el = document.documentElement,
      rfs =
        el.requestFullScreen
           || el.webkitRequestFullScreen
           || el.mozRequestFullScreen;
      console.log(rfs);
        rfs.call(el);
      //document.webkitRequestFullScreen();
        $('#wrapperu').dialog({
          open: function(event, ui){
            $('.ui-dialog-title').css('text-align','center');
            $('body').css('overflow','hidden');},
          width:'auto',
        height:'auto',
        title:_projectname+' selected Thread(s) Map',
        modal: true, 
          close: function( event, ui ) {
             $('body').css('overflow','auto'); 
             $('#wrapperu').dialog('destroy');
             $('#wrapperu').css('top', top);
             $('#sticky').css("z-index", stickyZIndex);
             $(that).fadeIn();
             $('#networkGraph_pieChart').show();
          }
      });
        $('div.ui-dialog-titlebar').css('height', '1em');
        $('div.ui-widget-content').css('overflow','hidden');
        return false;
      });

}

//new modified function for drawing the map.
function drawright(c_raw, c_right){
  //init background;
  var threadbg = document.createElement("div");
  threadbg.setAttribute("class","threadbg");
  var threadnotearea = document.createElement('div');
  threadnotearea.setAttribute("class","threadnote_area");
  c_right.appendChild(threadnotearea);
  c_right.appendChild(threadbg);
  var thread_TL = initthreadTLine(c_raw);
      //tmp solution
  if (thread_TL[0]==null && thread_TL[1]==null){
    return;
  }
  
  // draw notes 
  var mainObject ={};
  var arr=[];
  //var ch = draw_height/2;
  var craw = c_raw.children;
  //var yyoffset = 0;
  var clraw = craw.length; 
  for (var i = 0; i < clraw; i++){
    var localObj ={};
    var rnode = craw[i];
    var ctime = parseDT(rnode.getAttribute("date"));
    var title = rnode.children[3].firstChild.nodeValue;
    var ct = rnode.children[4];
    var content = ct.innerHTML;
    var author = rnode.getAttribute("author");
    author = author.replace(/^\s+|\s+$/g,'');
    var nnode = document.createElement("div");
    nnode.setAttribute("drawnoteid",rnode.getAttribute("noteid"));
    nnode.setAttribute("class","drawnote");
    nnode.setAttribute("title",title);
    nnode.setAttribute("author",rnode.getAttribute("author"));
    
    localObj["id"] = title;
    localObj["author"] = author;
    localObj["time"] = ctime;
    localObj["noteid"] = rnode.getAttribute("noteid");
    localObj["content"] = content;
    localObj["view"] = rnode.getAttribute("view");
    arr[i] = localObj;
  }

  mainObject.nodes = arr;
  
  /* Testing code related to buildons*/
  var buildson_links = visualizeBuildson(c_raw.getAttribute("focusname"));
   
  var buildson_index = [];
  //Check if the source-target exists and fetch the index 
  for(var i = 0; i < buildson_links.length; ++i) {
    var link_index = {};
      var source_index = findIndexByNoteId(buildson_links[i].source, mainObject.nodes);
      var target_index = findIndexByNoteId(buildson_links[i].target, mainObject.nodes);
      if(source_index != -1 && target_index != -1) {
          //push the key value pair of indexes to the array.
          link_index["source"] = source_index;
          link_index["target"] = target_index;
          link_index["type"] = "buildons";
          buildson_index.push(link_index);
    }
  }

  /* Testing code related to references*/
  var reference_links = visualizeReferences(c_raw.getAttribute("focusname"));
   
  var reference_index = [];
  
   // Check if the source-target exists and fetch the index 
   for(var i = 0; i< reference_links.length;++i){
     var link_index ={};
      var source_index = findIndexByNoteId(reference_links[i].source, mainObject.nodes);
      var target_index = findIndexByNoteId(reference_links[i].target, mainObject.nodes);
       if(source_index != -1 && target_index != -1) {
           //push the key value pair of indexes to the array.
           link_index["source"] = source_index;
           link_index["target"] = target_index;
           link_index["type"] = "references";
           reference_index.push(link_index);
     }
   }
  
  mainObject.links = buildson_index.concat(reference_index);
  //console.log('mainObj.links',mainObject.links);
  var ren = renderer();
  rens.push(ren);
  ren.drawGraph(mainObject, threadnotearea, mstline); 
}


//new modified function for drawing the complete relationship map.
/*function drawCompleteMapVisualization(){ 
  
  var root_raw = document.getElementById("raw_area");
  var mainObject ={};
  var arr =[];
  var linksArray = [];
  
  //store thread names and notecount in main object
  for (var h = 0;h< root_raw.children.length;++h){
    var localObj ={};
    localObj["id"] = (root_raw.children[h].getAttribute("focusname"));
    localObj["notecount"] =(root_raw.children[h].getAttribute("nt_num"));
    arr[h] = localObj;
  }
  
  mainObject.nodes =arr;
  
  //console.log('mainObjarray',arr);
  
 //compare threads to find common notes between them
  for (var i = 0;i< root_raw.children.length;++i){
    var c_raw1 = root_raw.children[i];
    
    var source_threadname = (c_raw1.getAttribute("focusname"));
    for(var j =i+1;j<root_raw.children.length;++j){
      var count = 0;
      var c_raw2 = root_raw.children[j];
      var target_threadname = (c_raw2.getAttribute("focusname"));
      for(var k=0;k<c_raw1.children.length;++k)
      {
       //console.log('c_raw1.children.length k'+k);
        for(var l=0;l<c_raw2.children.length;++l){
          //console.log('c_raw2.children.length l'+l);
          if((c_raw1.children[k].getAttribute("noteid")) === (c_raw2.children[l].getAttribute("noteid"))){
            count++;
            //console.log('count is ',count);
          }
        }
      }
      
    //create connections between thread based on common notes between them.
      var link_index ={};
      //console.log('count is'+count);
      var source_index = findIndexByThreadName(source_threadname, mainObject.nodes);
      var target_index =findIndexByThreadName(target_threadname, mainObject.nodes);
      link_index["source"] = source_index;
      link_index["target"] = target_index;
      link_index["value"] = count;
      linksArray.push(link_index);
  }
    
  }
  //console.log('mainObjectlinks',linksArray);
  mainObject.links = linksArray; 
  //console.log('mainObject',mainObject);
  
  var networkArea = document.getElementById('network_area');
  var netGraph = new networkGraph(networkArea, mainObject);
}
*/



//new modified function for drawing the complete relationship map under construction

function drawCompleteMapVisualization(){ 
  
  var root_raw = document.getElementById("raw_area");
  var mainObject ={};
  var arr =[];
  var linksArray = [];
  
  //store thread names and notecount in main object
  for (var h = 0;h< root_raw.children.length;++h){
    var localObj ={};
    localObj["id"] = (root_raw.children[h].getAttribute("focusname"));
    localObj["notecount"] =(root_raw.children[h].getAttribute("nt_num"));
    arr[h] = localObj;
  }
  
  mainObject.nodes =arr;
  
  //console.log('mainObjarray',arr);
  
 //compare threads to find common notes between them
  for (var i = 0;i< root_raw.children.length;++i){
    var c_raw1 = root_raw.children[i];
    
    var source_threadname = (c_raw1.getAttribute("focusname"));
    for(var j =i+1;j<root_raw.children.length;++j){
      var count = 0;
      var c_raw2 = root_raw.children[j];
      var target_threadname = (c_raw2.getAttribute("focusname"));
      for(var k=0;k<c_raw1.children.length;++k)
      {
       //console.log('c_raw1.children.length k'+k);
        for(var l=0;l<c_raw2.children.length;++l){
          //console.log('c_raw2.children.length l'+l);
          if((c_raw1.children[k].getAttribute("noteid")) === (c_raw2.children[l].getAttribute("noteid"))){
            count++;
            //console.log('count is ',count);
          }
        }
      }
      
    //create connections between thread based on common notes between them.
      var link_index ={};
      //console.log('count is'+count);
      var source_index = findIndexByThreadName(source_threadname, mainObject.nodes);
      var target_index =findIndexByThreadName(target_threadname, mainObject.nodes);
      link_index["source"] = source_index;
      link_index["target"] = target_index;
      link_index["value"] = count;
      link_index["type"] = "commonNoteCount";
      linksArray.push(link_index);
   }
    
  }
  
  
  
//compare threads to find cross buildons between them
  for (var i = 0;i< root_raw.children.length;++i){
    var c_raw1 = root_raw.children[i];    
    for(var j =i+1;j<root_raw.children.length;++j){
      //console.log('Iteration  i....****.........',i);
      //console.log('Iteration j.....****........',j);
    //swap the source and target thread name to get the count of cross-buildons from ThreadB to Thread A
      var source_threadname = (c_raw1.getAttribute("focusname")); 
      var buildson_links = visualizeBuildson(source_threadname);
      var counter = 0;
      var c_raw2 = root_raw.children[j];
      //console.log("source_threadnam",source_threadname);
      var target_threadname = (c_raw2.getAttribute("focusname"));
      //console.log("target_threadnam",target_threadname);
      //thread A children target noteid's
      //console.log('linkByIndexSourceTarget in cross buildon',linkByIndexSourceTarget);
      
      for(var k=0;k< buildson_links.length;++k)
      {
        
        if( (buildson_links[k].source+","+buildson_links[k].target) in linkByIndexSourceTarget)
        {
          //do nothing
        } 
        else
        {
          //Thread B children noteid's 
            for(var l=0;l<c_raw2.children.length;++l){
              //console.log('c_raw2.children.length l'+l);
               if((buildson_links[k].target) === (c_raw2.children[l].getAttribute("noteid"))){
                 counter++;
                 console.log('count is ',counter);
               }
          }
        }
      }
      
    //create connections between thread based on cross-buildons between them.
      var link_index ={};
      //console.log('count is'+count);
      var source_index = findIndexByThreadName(source_threadname, mainObject.nodes);
      var target_index =findIndexByThreadName(target_threadname, mainObject.nodes);
      link_index["source"] = source_index;
      link_index["target"] = target_index;
      link_index["value"] = counter;
      link_index["type"] = "crossBuildons";
      linksArray.push(link_index);
   
    
    //swap the source and target thread name to get the count of cross-buildons from Thread B to Thread A
      
      target_threadname = source_threadname;
      source_threadname = (c_raw2.getAttribute("focusname"));
      
      //console.log("source_threadnam........",source_threadname);
      //console.log("target_threadnam........",target_threadname);
      counter = 0;
      buildson_links = visualizeBuildson(source_threadname);
      c_raw2 = root_raw.children[i];
      for(var k=0;k< buildson_links.length;++k)
      {
        //console.log('linkByIndexSourceTarget',linkByIndexSourceTarget);
        if( (buildson_links[k].source+","+buildson_links[k].target) in linkByIndexSourceTarget)
        {
          //do nothing
        } 
        else
        {
        //Thread B children noteid's 
        for(var l=0;l<c_raw2.children.length;++l){
          //console.log('c_raw2.children.length l'+l);
          if((buildson_links[k].target) === (c_raw2.children[l].getAttribute("noteid"))){
            counter++;
            console.log('count is ',counter);
          }
        }
      }
     }
    //create connections between thread based on cross-buildons between them.
      link_index ={};
      //console.log('count is'+count);
      var source_index = findIndexByThreadName(source_threadname, mainObject.nodes);
      var target_index =findIndexByThreadName(target_threadname, mainObject.nodes);
      link_index["source"] = source_index;
      link_index["target"] = target_index;
      link_index["value"] = counter;
      link_index["type"] = "crossBuildons";
      linksArray.push(link_index);
      //console.log('linksArray',linksArray);
    }
 }
  
  mainObject.links = linksArray; 
  //console.log('I am printing this');
  //console.log('mainObject',mainObject);
  //console.log('i am done');
  
  var networkArea = document.getElementById('network_area');
  netGraph = new networkGraph(networkArea, mainObject);
}




//Global variables
var mainCompositeObject ={};
var arr =[];
//var buildson_index = [];
//var reference_index = [];
var counter = 0;

//new modified function for drawing the cross relationship between notes.
function drawBigBangVisualization(){ 
  mainCompositeObject = {};
  arr = [];
  
  counter = 0;
  var groups = [];
  var root_raw = document.getElementById("raw_area");
  for(var i =0;i<root_raw.children.length;++i) {
    var c_raw = root_raw.children[i];
    var focusname = c_raw.getAttribute("focusname");
    groups.push(focusname);
    var craw = c_raw.children;
    
    var clraw = craw.length;
    for(var j = 0; j < clraw;++j) {
      var localObj ={};
      var rnode = craw[j];
      var ctime = parseDT(rnode.getAttribute("date"));
      var title = rnode.children[3].firstChild.nodeValue;
      var ct = rnode.children[4];
      var content = ct.innerHTML;
      var author = rnode.getAttribute("author");
      author = author.replace(/^\s+|\s+$/g,'');
      localObj["id"] = title;
      localObj["group"] = focusname;
      localObj["author"]=author;
      localObj["time"]=ctime;
      localObj["noteid"]=rnode.getAttribute("noteid");
      localObj["content"] = content;
      localObj["view"] = rnode.getAttribute("view");
      localObj["highlight_state"] = rnode.getAttribute("highlight");
      arr[counter] =localObj;
      counter++;
    }
  }
  mainCompositeObject.groups = groups;
  mainCompositeObject.nodes = arr;
  var linksArr = [];
  linkByIndexSourceTarget ={};
  console.log('mainCompositeObject nodes', mainCompositeObject.nodes);
  
  for(var j =0;j<root_raw.children.length;++j) {
    var c_raw = root_raw.children[j];
    var focusname = c_raw.getAttribute("focusname");
    linksArr = linksArr.concat(drawCompositeVisualization(focusname,linkByIndexSourceTarget, true));
    //console.log('focusname',focusname);
    //console.log('linksArr true same thread',linksArr);
  }
  //console.log('linkByIndexSourceTarget buildons',linkByIndexSourceTarget);
  for(var j =0;j<root_raw.children.length;++j) {
    var c_raw = root_raw.children[j];
    var focusname = c_raw.getAttribute("focusname");
    linksArr = linksArr.concat(drawCompositeVisualization(focusname,linkByIndexSourceTarget, false));
    //console.log('linksArr false different threads',linksArr);
  }
  console.log('linkByIndexSourceTarget cross-buildons',linkByIndexSourceTarget);
   mainCompositeObject.links = linksArr;
   //console.log('linksArr',linksArr);
   //console.log('mainCompositeObject.links linksArr',mainCompositeObject.links);
  //drawCrossBuildsonVisualization(root_raw);
   
  $($('.thread_right')[1]).append('<div class="threadnote_area" style="height: 400px;"></div>');
  comGraph = new compositeGraph(
      $('.threadnote_area').get(1), mainCompositeObject, mstline);
  
  // Color left as well
  if(comGraph){
    var thread_divs = $('.thread_left').children();
    for (var i = 0; i < thread_divs.length; ++i) {
      var color = comGraph.getColor($(thread_divs[i]).attr("focusname"));
      var rgba = "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
      //rgba.a = 0.1;
      //console.log('rgbs', rgba);
      $(thread_divs[i]).css("background-color", rgba);
    }
  }
  
  $("body").on("composite-deselected", function() {
    $("#toggle-node-connections").html("Show Common"); 
  });
  
  toggle();
  toggleBuildonsAll(document.getElementById('toggle-buildons'));
  toggleReferencesAll(document.getElementById('toggle-references'));
}

//Draw the complete visualization in one graph with buildons and references
function drawCompositeVisualization(focusname,linkByIndexSourceTargetm, checkInSameThread){
  //var linksArray = [];
  var buildson_index = []; 
  //console.log('focusname',focusname);
  //console.log('mainCompositeObject.nodes',mainCompositeObject.nodes);
  /* Testing code related to buildons*/
  var buildson_links = visualizeBuildson(focusname);
  //console.log('buildson_links',buildson_links);
  //Check if the source-target exists and fetch the index 
  for(var i = 0; i < buildson_links.length; ++i) {
    var link_index = {};
    var source_index =[];
    var target_index =[];
    
    //console.log('source',buildson_links[i].source);
    //console.log('target',buildson_links[i].target);
      source_index = findIndexByNoteId(buildson_links[i].source, mainCompositeObject.nodes);
      target_index = findIndexByNoteId(buildson_links[i].target, mainCompositeObject.nodes);
      if(source_index.length > 0 && target_index.length > 0){
        for(var j =0; j< source_index.length;++j){
          
          //console.log('source_index.length',source_index.length);
          for(var k=0; k<target_index.length;++k){
            //initialize the object
            link_index = {};
            //console.log('target_index.length',target_index.length);
           
        //push the key value pair of indexes to the array.
            
          var sourceThreadGroup = mainCompositeObject.nodes[source_index[j]].group;
          //console.log('mainCompositeObject.nodes[source_index].group',mainCompositeObject.nodes[source_index[j]].group);
          var targetThreadGroup = mainCompositeObject.nodes[target_index[k]].group;
          //console.log('mainCompositeObject.nodes[target_index].group',mainCompositeObject.nodes[target_index[k]].group);
          link_index["source"] = (source_index[j]); 
          link_index["target"] = (target_index[k]);
          link_index["type"] = "buildons";
          
          if (checkInSameThread && sourceThreadGroup === targetThreadGroup) {
           
            // Create this link and add it go to the hash table
            //buildson_index.push(link_index);
            buildson_index.push(link_index);
            linkByIndexSourceTargetm[mainCompositeObject.nodes[source_index[j]].noteid+","+mainCompositeObject.nodes[target_index[k]].noteid] = 1;
          } 
          if (!checkInSameThread && sourceThreadGroup != targetThreadGroup) 
          {
            
            //Traverse through the hash table
            // Check if the key exists in the hash table 
            // If it does, then just continue
            // If not then add a new link to the graph, and move on to the next one
            //link_index["type"] = "cross-buildons";
            
            if( (mainCompositeObject.nodes[source_index[j]].noteid+","+mainCompositeObject.nodes[target_index[k]].noteid) in linkByIndexSourceTargetm)
            {
              //souce-target exists so do nothing
            }
            else
            {
              buildson_index.push(link_index); 
            }
            
          }
        }
      }
    }
      
  }
   // console.log('buildson_index ',buildson_index);
  /* Testing code related to references*/
  var reference_index = [];
  var reference_links = visualizeReferences(focusname); 
  
   // Check if the source-target exists and fetch the index 
   for(var i = 0; i< reference_links.length;++i){
     var link_index ={};
     var source_index =[];
     var target_index =[];
     //console.log('source',reference_links[i].source);
     //console.log('target',reference_links[i].target);
      source_index = findIndexByNoteId(reference_links[i].source, mainCompositeObject.nodes);
      target_index = findIndexByNoteId(reference_links[i].target, mainCompositeObject.nodes);
      if(source_index.length > 0 && target_index.length > 0){
        for(var j =0; j< source_index.length;++j){ 
          for(var k=0; k<target_index.length;++k){
            //initialize the object
            link_index ={};
          //push the key value pair of indexes to the array.
            var sourceThreadGroup = mainCompositeObject.nodes[source_index[j]].group;
            //console.log('mainCompositeObject.nodes[source_index].group',mainCompositeObject.nodes[source_index[j]].group);
            var targetThreadGroup = mainCompositeObject.nodes[target_index[k]].group;
            //console.log('mainCompositeObject.nodes[target_index].group',mainCompositeObject.nodes[target_index[k]].group);
            link_index["source"] = source_index[j];
            link_index["target"] = target_index[k];
            link_index["type"] = "references";
            
           if (checkInSameThread && sourceThreadGroup === targetThreadGroup) {
             //link_index["type"] = "references";
             // Create this link and add it go to the hash table
             //buildson_index.push(link_index);
             reference_index.push(link_index);
             linkByIndexSourceTargetm[source_index[j].noteid+","+target_index[k].noteid] = 1;
           } 
           else 
           {
             //link_index["type"] = "references";
             //Traverse through the hash table
             // Check if the key exists in the hash table 
             // If it does, then just continue
             // If not then add a new link to the graph, and move on to the next one
             //link_index["type"] = "cross-buildons";
             
             if( (source_index[j].noteid+","+target_index[k].noteid) in linkByIndexSourceTargetm)
             {
               //souce-target exists so do nothing
             }
             else
             {
               reference_index.push(link_index); 
             }
           }
           
          }
        }
     }
   }
   
   return(buildson_index.concat(reference_index));
  
   //mainCompositeObject.links = buildson_index.concat(reference_index);
   //console.log('mainCompositeObject.links',mainCompositeObject.links);
}





function CompareThreadNotes(threadfocus1,threadfocus2)
{
  var parent = $('#raw_area');
}

function toggle() {
  /// Reset to hide titles
  toggleTitlesAll();
  toggleAuthorsAll();
  toggleHighlightedNotes();
  
  //toggleHighlightedNotes();
}

function toggleTitlesAll(elem) {
  var visibility = false;
  
  if (elem && elem.innerHTML === "Show Title") {
    $(elem).html("Hide Title");
    visibility = true;
  } else if (elem && elem.innerHTML === "Hide Title") {
    $(elem).html("Show Title");
    visibility = false;
  }
  
  if (!elem) {
    $("#toggle-titles").html("Show Title");
  }
  
  if (comGraph) {
    comGraph.toggleTitles(visibility);
  }
}

function toggleAuthorsAll(elem) {
var visibility = false;
  
  if (elem && elem.innerHTML === "Show Author") {
    $(elem).html("Hide Author");
    visibility = true;
  } else if (elem && elem.innerHTML === "Hide Author") {
    $(elem).html("Show Author");
    visibility = false;
  }
  
  if (!elem) {
    $("#toggle-authors").html("Show Author");
  }
  
  if (comGraph) {
    comGraph.toggleAuthors(visibility);
  }
}

function toggleReferencesAll(elem,noLinks) {
  for(var i = 0; i < rens.length; ++i ) {
    rens[i].toggleLinks(elem, 'references');
    rens[i].redraw();
  }
  
  if (comGraph) {  
    comGraph.toggleLinks(elem, 'references',noLinks);
  }
}

function toggleBuildonsAll(elem,noLinks) {
  for(var i = 0; i < rens.length; ++i ) {
    // console.log('toggle links');
    rens[i].toggleLinks(elem, 'buildons');
    rens[i].redraw();
  }
  
  if (comGraph) {
    comGraph.toggleLinks(elem, 'buildons',noLinks);
  }
}

/** 
 * Toggle node connections
 */
function toggleDrawAllNodeConnections(elem,alertCommon) {
  if (elem) {
    if ($(elem).html() === "Show Common") {
      $(elem).html("Hide Common");
    } else {
      $(elem).html("Show Common"); 
      if (comGraph) {
        comGraph.deselect();
        return;
      }
    }
  }
  
  if (comGraph) {
    var success = comGraph.drawAllNodeConnections(elem,alertCommon);
    if (!success ) {
      $(alertCommon).dialog();
      $(elem).html("Show Common"); 
    }
  } else {
    // Same here
    $(elem).html("Hide Common");
  }
  
  if (!elem) {
    $("#toggle-node-connections").html("Show Common");
  }
}

/**
 * Show highlighted nodes
 */

function toggleHighlightedNotes(elem,alertHighlight){
  if(elem) {
    if( elem && $(elem).html() === "Show Highlighted Notes"){
      $(elem).html("Show All Notes");
    } else {
      $(elem).html("Show Highlighted Notes");
      if (comGraph) {
        comGraph.showAllNotes();
        //comGraph.deselect();
        return;
      }
    }
  }
  if (!elem) {
    $("#toggle-highlights").html("Show Highlighted Notes");
    return;
  }
  
  if (comGraph){
    comGraph.showHighlighted();
 }
  
}

/** 
 * Create an array of buildson
 */
function visualizeBuildson(focusname) {
  var buildson_links = [];
  var parent = $('#raw_area');
  //console.log('parent',parent);
  // This will give us thread names
  var children = parent.children();

  children.each(function() {

    if (focusname !== null || focusname !== undefined) {
      if (focusname !== this.getAttribute('focusname')) {
        //console.log('returning since focusname ',focusname);
        return true;
      }
    }
    
    // We get one note now
    var row_focus = $(this);
    var grand_children = row_focus.children('div.rawnote');
    
    for (var i = 0; i < grand_children.length; ++i) {
      var raw_note = $(grand_children[i]);

      var great_grand_children = raw_note.children('div.buildsons');
      great_grand_children.each(function() {
        var great_great_grand_children = $(this).children();

        great_great_grand_children.each(function() {
          var buildson = $(this);
          var link = {};
          link["source"] = raw_note.attr('noteid');
          link["target"] = buildson.attr('target');
          //link_index["type"] = "buildons";
          buildson_links.push(link);
        });
      });
    }
  });

  //console.log('buildson_links ', buildson_links);
  return buildson_links;
}

/**
 * Create an array of references
 */
function visualizeReferences(focusname)
{
  var reference_links = [];
  var parent = $('#raw_area');
  //console.log('parent',parent);
  // This will give us thread names
  var children = parent.children();

  children.each(function() {

    if (focusname !== null || focusname !== undefined) {
      if (focusname !== this.getAttribute('focusname')) {
        //console.log('returning since focusname ',focusname);
        return true;
      }
    }
    
    // We get one note now
    var row_focus = $(this);
    var grand_children = row_focus.children('div.rawnote');
    
    for (var i = 0; i < grand_children.length; ++i) {
      var raw_note = $(grand_children[i]);

      var great_grand_children = raw_note.children('div.references');
      great_grand_children.each(function() {
        var great_great_grand_children = $(this).children();

        great_great_grand_children.each(function() {
          var reference = $(this);
          var link = {};
          link["source"] = raw_note.attr('noteid');
          link["target"] = reference.attr('target');
          //link_index["type"] = "references";
          reference_links.push(link);
        });
      });
    }
  });

  //console.log('reference_links ', reference_links);
  return reference_links;
}

/**
 * Find if noteid present in the main object array
 */
function findIndexByNoteId(noteid, mainObject_nodes) {
  var arrOfIndex = [];
  var counter = 0;
  for(var i = 0; i < mainObject_nodes.length; i++ ) {
      if(noteid == mainObject_nodes[i].noteid) {
        arrOfIndex[counter] = i;
        //return i;
        counter++;
      }
  }
  //console.log('arrOfIndex',arrOfIndex);
  return arrOfIndex;
 
}

/**
 * Find if threadname present in the main object array
 */
function findIndexByThreadName(threadname, mainObject_nodes) {
  for(var i = 0; i < mainObject_nodes.length; i++ ) {
      if(threadname == mainObject_nodes[i].id) {
         return i;
      }
  }
  return -1;
}

function windowmoveleft(){
	var pp = document.getElementById("pointer");
	if (isNaN(parseInt(pp.style.left))) {pp.style.left = "0px";}
	var ll = parseInt(pp.style.left);
	pp.style.left = ll - parseInt(pp.style.width) + "px";
	edgecheck();
	redraw();
}

function windowmoveright(){
	var pp = document.getElementById("pointer");
	if (isNaN(parseInt(pp.style.left))) {pp.style.left = "0px";}
	var ll = parseInt(pp.style.left);
	pp.style.left = ll + parseInt(pp.style.width) + "px";
	edgecheck();
	redraw();
}

function redraw(){
	var root_raw = document.getElementById("raw_area");
	var root_draw = document.getElementById("draw_area");
//	for (var i = 0; i< root_draw.children.length;i++){
//		var cnode = root_draw.children[i];
//		for (var k=0; k< cnode.children.length;k++){
//			if (cnode.children[k].getAttribute("class")=="thread_right"){
//				cnode = cnode.children[k];
//				while(cnode.children.length != 0){
//					cnode.removeChild(cnode.children[0]);
//				}
//				break;
//			}
//		}		
//		drawright(root_raw.children[i],cnode);
//	}
//	checkflag();
}

function initthreadTLine(e){
	var firsttime=null;
	var lasttime=null;
	var rchildren = e.children;
	var rlength = e.children.length;
	for (var i = 0; i < rlength; i++)
	{
		var currenttime = rchildren[i].getAttribute("date");
		if (firsttime == null) {
			firsttime = currenttime;
		}
		if (lasttime == null) {
			lasttime =currenttime;
		}
		if (compareDate(firsttime,currenttime) == 1){
			firsttime = currenttime;
		}
		if (compareDate(lasttime,currenttime) == -1){
			lasttime = currenttime;
		}
	}
	return [firsttime,lasttime];
}

function edgecheck(){
	var pp=document.getElementById("pointer");
	if (isNaN(parseInt(pp.style.left))) {pp.style.left = "0px";}
	var ll = parseInt(pp.style.left);
	var ww = parseInt(pp.style.width);
	var rr = ww+ll;
	if (rr > bar_width){
		pp.style.left = bar_width-parseInt(pp.style.width)+"px";
	}
	if (ll < 0){
		pp.style.left = "0px";
	}
}

function bardecide(e,all){
	var minutes=1000*60;
	var hours=minutes*60;
	var days=hours*24;
	var week=days*7;
	var month=days*30;
	var result;
	switch (e){
		case 0: 	
			if (all<days*2) result = 5;
			else result = e;
			break;
		case 1:
			if (all<week) result = 5;
			else result = e;
			break;
		case 2:
			if (all<week*2) result = 5;
			else result = e;
			break;
		case 3:
			if (all<month) result = 5;
			else result = e;
			break;
		case 4:
			if (all<month*3) result = 5;
			else result = e;
			break;
		case 5:
			result = 5;

	}
	return result
}
////////////////////////////////////////////////
//
//    LINKS
//
////////////////////////////////////////////////
//links TODO

function checkflag(){
	//clean up links
	var root_draw = document.getElementById("draw_area");
	for (var i=0;i<root_draw.children.length;i++){
		var cnode = root_draw.children[i].children[1];
		//reference_area
		var tnode = cnode.children[0];
		while(tnode.children.length != 0){
			tnode.removeChild(tnode.children[0]);
		}
		//buildon_area
		tnode = cnode.children[1];
		while(tnode.children.length != 0){
			tnode.removeChild(tnode.children[0]);
		}
		//annotate_area
		tnode = cnode.children[2];
		while(tnode.children.length != 0){
			tnode.removeChild(tnode.children[0]);
		}
	}
	
	if (title_flag == 1){
		var cnode;
		for (var i=0; i<root_draw.children.length;i++){
			cnode = root_draw.children[i].children[1].children[4];
			for (var k=0;k<cnode.children.length;k++){
				dnode = cnode.children[k];
				var dv = document.createElement("div");
				dv.setAttribute("class","drawtitle");
				dnode.appendChild(dv);
				dv.appendChild(document.createTextNode(dnode.getAttribute("title")));
			}
		}
	}
	if (author_flag == 1){
		var cnode;
		for (var i=0; i<root_draw.children.length;i++){
			cnode = root_draw.children[i].children[1].children[4];
			for (var k=0;k<cnode.children.length;k++){
				dnode = cnode.children[k];
				var dv = document.createElement("div");
				dv.setAttribute("class","drawauthor");
				dnode.appendChild(dv);
				dv.appendChild(document.createTextNode(dnode.getAttribute("author")));
			}
		}
	}	
	if (ref_flag == 1){
		var cnode;
		for (var i = 0; i < root_draw.children.length;i++){
			cnode = root_draw.children[i].children[1].children[0];
			var r_draw = root_draw.children[i].children[1].children[4];
			for (var k=0;k<r_draw.children.length;k++){
				drawsinglelink_ref(r_draw.children[k].getAttribute("drawnoteid"),cnode)
			}
		}
	}
	if (bld_flag == 1){
		var cnode;
		for (var i = 0; i < root_draw.children.length;i++){
			cnode = root_draw.children[i].children[1].children[1];
			var r_draw = root_draw.children[i].children[1].children[4];
			for (var k=0;k<r_draw.children.length;k++){
				drawsinglelink_bld(r_draw.children[k].getAttribute("drawnoteid"),cnode)
			}
		}
	}
	if (ant_flag == 1){
		var cnode;
		for (var i = 0; i < root_draw.children.length;i++){
			cnode = root_draw.children[i].children[1].children[2];
			var r_draw = root_draw.children[i].children[1].children[4];
			for (var k=0;k<r_draw.children.length;k++){
				drawsinglelink_ant(r_draw.children[k].getAttribute("drawnoteid"),cnode)
			}
		}
	}
}

function drawsinglelink_ant(id,r_draw){
	//input "noteid"
	var root_raw = document.getElementById("raw_area");
	for (var i=0;i< root_raw.children.length;i++){
		if (root_raw.children[i].getAttribute("focusname") == r_draw.parentNode.parentNode.getAttribute("threadfocus")){
			root_raw = root_raw.children[i];
			break;
		}
	}
	//fint current note
	for (var i = 0; i < root_raw.children.length; i++){
		if (root_raw.children[i].getAttribute("noteid") == id){
			cnt = i;
			break;
		}
	}
	//find referrences
	root_raw = root_raw.children[cnt];
	cnt = root_raw.children.length;
	for (var i = 0; i < cnt; i++){
		if (root_raw.children[i].getAttribute("class") == "annotates"){
			cnt = i;
			break;
		}
	}
	root_raw = root_raw.children[cnt];
	//find single reference
	var tnodes = root_raw.children;
	//check reference node if on draw_area
	cnt = tnodes.length;
	for (var i = 0; i < cnt; i++){
		var tnode = tnodes[i].getAttribute("target");
		if (checkn2d(tnode,r_draw) == 1){
			//target in draw_area
			drawlink(id,tnode,"ant",r_draw);
		}
	}
}

function drawsinglelink_bld(id,r_draw){
	//input "noteid"
	var root_raw = document.getElementById("raw_area");
	for (var i=0;i< root_raw.children.length;i++){
		if (root_raw.children[i].getAttribute("focusname") == r_draw.parentNode.parentNode.getAttribute("threadfocus")){
			root_raw = root_raw.children[i];
			break;
		}
	}
	//fint current note
	for (var i = 0; i < root_raw.children.length; i++){
		if (root_raw.children[i].getAttribute("noteid") == id){
			cnt = i;
			break;
		}
	}
	//find referrences
	root_raw = root_raw.children[cnt];
	cnt = root_raw.children.length;
	for (var i = 0; i < cnt; i++){
		if (root_raw.children[i].getAttribute("class") == "buildsons"){
			cnt = i;
			break;
		}
	}
	root_raw = root_raw.children[cnt];
	//find single reference
	var tnodes = root_raw.children;
	//check reference node if on draw_area
	cnt = tnodes.length;
	for (var i = 0; i < cnt; i++){
		var tnode = tnodes[i].getAttribute("target");
		if (checkn2d(tnode,r_draw) == 1){
			//target in draw_area
			drawlink(id,tnode,"bld",r_draw);
		}
	}
}

function drawsinglelink_ref(id,r_draw){
	//input "noteid"
	var root_raw = document.getElementById("raw_area");
	for (var i=0;i< root_raw.children.length;i++){
		if (root_raw.children[i].getAttribute("focusname") == r_draw.parentNode.parentNode.getAttribute("threadfocus")){
			root_raw = root_raw.children[i];
			break;
		}
	}
	//fint current note
	for (var i = 0; i < root_raw.children.length; i++){
		if (root_raw.children[i].getAttribute("noteid") == id){
			cnt = i;
			break;
		}
	}
	//find referrences
	root_raw = root_raw.children[cnt];
	cnt = root_raw.children.length;
	for (var i = 0; i < cnt; i++){
		if (root_raw.children[i].getAttribute("class") == "references"){
			cnt = i;
			break;
		}
	}
	root_raw = root_raw.children[cnt];
	//find single reference
	var tnodes = root_raw.children;
	//check reference node if on draw_area
	cnt = tnodes.length;
	for (var i = 0; i < cnt; i++){
		var tnode = tnodes[i].getAttribute("target");
		if (checkn2d(tnode,r_draw) == 1){
			//target in draw_area
			drawlink(id,tnode,"ref",r_draw);
		}
	}
}

function drawlink(id,tnode,type,r_draw){
	var root_draw = r_draw.parentNode.children[4];
	var cnt = root_draw.children.length;
	var srcnode = 0;
	var tgtnode = 0;
	for (var i = 0; i < cnt; i++){
		if ( root_draw.children[i].getAttribute("drawnoteid") == tnode){
			srcnode = root_draw.children[i];
		}
		if ( root_draw.children[i].getAttribute("drawnoteid") == id){
			tgtnode = root_draw.children[i];
		}
		if ( srcnode != 0 && tgtnode != 0 ) break;
	}
	//init none 0px var
	var srcnodex,srcnodey,tgtnodex,tgtnodey;
	if (isNaN(parseInt(srcnode.style.left))) {srcnode.style.left = "0px";}
	if (isNaN(parseInt(srcnode.style.top))) {srcnode.style.top = "0px";}
	if (isNaN(parseInt(tgtnode.style.left))) {tgtnode.style.left = "0px";}
	if (isNaN(parseInt(tgtnode.style.top))) {tgtnode.style.top = "0px";}
	//input src_xy,tgt_xy
	srcnodex = parseInt(srcnode.style.left);
	srcnodey = parseInt(srcnode.style.top);
	tgtnodex = parseInt(tgtnode.style.left);
	tgtnodey = parseInt(tgtnode.style.top);
	switch (type){
		case "ref":
			drawlink_ref([srcnodex,srcnodey],[tgtnodex,tgtnodey],r_draw);
			break;
		case "bld":
			drawlink_bld([srcnodex,srcnodey],[tgtnodex,tgtnodey],r_draw);
			break;
		case "ant":
			drawlink_ant([srcnodex,srcnodey],[tgtnodex,tgtnodey],r_draw);
			break;
		default:
			alert("none available link_area" + type);
	}
}

function drawlink_ant(srcnode,tgtnode,r_draw){
	var layer = r_draw;
	if (srcnode[1] == tgtnode[1]){
		//on same y level, straight line
		if (((tgtnode[0] - srcnode[0])>draw_node_width)&&((tgtnode[0]-srcnode[0])<=(draw_node_width+draw_node_margin+2))){
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-(srcnode[0]+draw_node_width)+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//on same y level, need top space
		else if ((tgtnode[0] - srcnode[0])>(draw_node_width+draw_node_margin)){
			//end to srcnode '-'
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "10px";
			line.style.top = srcnode[1]-2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+6+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-srcnode[0]-draw_node_width-4-1-1-3+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]-2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+6+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "10px";
			line.style.top = srcnode[1]-2+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
	}
	if (srcnode[1] < tgtnode[1]){
		//2 shape
		if (tgtnode[0]-srcnode[0]< draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-1)-(srcnode[1]+7)+"px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+6)-(tgtnode[0]-1)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-2+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "10px";
			line.style.top = tgtnode[1]-2+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]+8)-(srcnode[1]+7)+"px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
		//z shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-1)-(srcnode[1]+7)+"px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-1-1)-(srcnode[0]+6+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+6+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "10px";
			line.style.top = tgtnode[1]-2+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
	}
	if (srcnode[1] > tgtnode[1]){
		//s shape
		if (tgtnode[0]-srcnode[0]< draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+7+1)-(tgtnode[1]+draw_node_width+6)+"px";
			line.style.top = tgtnode[1]+draw_node_width+6+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+6)-(tgtnode[0]-1)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+6+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "10px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+6+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+7)-(tgtnode[1]+6)+"px";
			line.style.top = tgtnode[1]+6+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+6+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
		//reversed 3 shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "6px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+8)-(tgtnode[1]+draw_node_width+6)+"px";
			line.style.top = tgtnode[1]+draw_node_width+6+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-3-1)-(srcnode[0]+4+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+6+draw_node_margin+"px";
			line.style.left = srcnode[0]+6+1+draw_node_width+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "10px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+7+draw_node_margin+"px";
			line.style.left = tgtnode[0]-1+draw_node_margin+"px";
		}
	}
}

function drawlink_bld(srcnode,tgtnode,r_draw){
	var layer = r_draw;
	if (srcnode[1] == tgtnode[1]){
		//on same y level, straight line
		if (((tgtnode[0] - srcnode[0])>draw_node_width)&&((tgtnode[0]-srcnode[0])<=(draw_node_width+draw_node_margin+2))){
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-(srcnode[0]+draw_node_width)+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//on same y level, need top space
		else if ((tgtnode[0] - srcnode[0])>(draw_node_width+draw_node_margin)){
			//end to srcnode '-'
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = srcnode[1]-4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+3+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-srcnode[0]-draw_node_width-3-1-1-3+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]-4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+3+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = srcnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
	}
	if (srcnode[1] < tgtnode[1]){
		//2 shape
		if (tgtnode[0]-srcnode[0]< draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-3)-(srcnode[1]+3)+"px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+3)-(tgtnode[0]-3)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]+4)-(srcnode[1]+3)+"px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
		//z shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-3)-(srcnode[1]+3)+"px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-3-1)-(srcnode[0]+3+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+3+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
	}
	if (srcnode[1] > tgtnode[1]){
		//s shape
		if (tgtnode[0]-srcnode[0]< draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+4)-(tgtnode[1]+draw_node_width+3)+"px";
			line.style.top = tgtnode[1]+draw_node_width+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+3)-(tgtnode[0]-3)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+4)-(tgtnode[1]+3)+"px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
		//reversed 3 shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+4)-(tgtnode[1]+draw_node_width+3)+"px";
			line.style.top = tgtnode[1]+draw_node_width+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-3-1)-(srcnode[0]+3+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+3+draw_node_margin+"px";
			line.style.left = srcnode[0]+3+1+draw_node_width+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+3+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
		}
	}
}

function drawlink_ref(srcnode,tgtnode,r_draw){
	var layer = r_draw;
	if (srcnode[1] == tgtnode[1]){
		//on same y level, straight line
		if (((tgtnode[0] - srcnode[0])>draw_node_width)&&((tgtnode[0]-srcnode[0])<=(draw_node_width+draw_node_margin+2))){
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-(srcnode[0]+draw_node_width)+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+draw_node_width+1+"px";
			line.style.left = srcnode[0]+draw_node_width+"px";
		}
		//on same y level, need top space
		else if ((tgtnode[0] - srcnode[0])>(draw_node_width+draw_node_margin)){
			//end to srcnode '-'
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = srcnode[1]-6+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+1+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-srcnode[0]-draw_node_width-1-1-1-5+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]-6+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+1+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = srcnode[1]-6+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
	}
	if (srcnode[1] < tgtnode[1]){
		//2 shape
		if (tgtnode[0]-srcnode[0]< draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-5)-(srcnode[1]+1)+"px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+1+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+1)-(tgtnode[0]-5)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-6+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]-6+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]+2)-(srcnode[1]+1)+"px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+1+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
		//z shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-5)-(srcnode[1]+1)+"px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+1+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-5-1)-(srcnode[0]+1+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-6+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+1+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]-6+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
	}
	if (srcnode[1] > tgtnode[1]){
		//s shape
		if (tgtnode[0]-srcnode[0]< draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+2)-(tgtnode[1]+draw_node_width+1)+"px";
			line.style.top = tgtnode[1]+draw_node_width+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+1+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+1)-(tgtnode[0]-5)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+2)-(tgtnode[1]+1)+"px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+1+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
		//reversed 3 shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+2)-(tgtnode[1]+draw_node_width+1)+"px";
			line.style.top = tgtnode[1]+draw_node_width+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+1+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-5-1)-(srcnode[0]+1+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+1+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "8px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
		}
	}
}

function checkn2d(tnode,r_draw){
	var root_draw = r_draw.parentNode.children[4];
	var cnt = root_draw.children.length;
	var result = 0;
	for (var i = 0; i < cnt; i++){
		if ( root_draw.children[i].getAttribute("drawnoteid") == tnode){
			result = 1;
			break;
		}
	}
	return result;
}

//bar pointer move
var _startX = 0;            // mouse starting positions
var _offsetX = 0;           // current element offset
var _dragElement;           // pass the element
var _moving = 0;
var _blockwidth = bar_width;

function ptdown(e){
	var pp=document.getElementById("pointer");
	_blockwidth = parseInt(pp.style.width);
	var pt;
	e = e ? e : window.event;
	if (e.target) pt = e.target;
	if (_moving == 0 ){
		if (isNaN(parseInt(pt.style.left))) {pt.style.left = "0px";}
		_offsetX = parseInt(pt.style.left);
		_startX = e.clientX;
		_dragElement = pt;
		_moving = 1;
		document.onmousemove = ptmove;
	}
	else if (_moving == 1){
		ptup(e);
	}
}

function ptmove(e){
	e = e ? e : window.event;
	_dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
	if (parseInt(_dragElement.style.left) < 0) {_dragElement.style.left = "0px";}
	if (parseInt(_dragElement.style.left) > (bar_width - _blockwidth)) {_dragElement.style.left = (bar_width - _blockwidth)+"px";}
}

function ptup(e){
	e = e ? e : window.event;
	document.onmousemove = null;
	document.onmouseup = null;
	document.onselectstart = null;
	_dragElement = null;
	_moving = 0;
	redraw();
}

function updateMap(xScale, yScale) {
  for(var i = 0; i < rens.length; ++i) {
    rens[i].updateView(xScale, yScale);
    rens[i].redraw();
  }
  var domain = xScale.domain();
  comGraph.recomputePositions(domain);
  $("#slider").slider({ values: [ domain[0], domain[1] ] }); 
}

////////////////////////////////
//
//     triggers
//
////////////////////////////////
/*function showallauthor(){
	var pp = document.getElementById("showallauthor");
	pp = pp.children[0];
	if (pp.firstChild.nodeValue == "Show Author"){
		pp.firstChild.nodeValue = "Hide Author";
		//author_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Author"){
		pp.firstChild.nodeValue = "Show Author";
		//author_flag = 0;
	}
	else alert("error");
	//redraw();
}
function showalltitle(){
	var pp = document.getElementById("showalltitle");
	pp = pp.children[0];
	if (pp.firstChild.nodeValue == "Show Title"){
		pp.firstChild.nodeValue = "Hide Title";
		//title_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Title"){
		pp.firstChild.nodeValue = "Show Title";
		//title_flag = 0;
	}
	else alert("error");
	//redraw();
}*/

function showreflink(){
	var pp = document.getElementById("showalllink");
	pp = pp.children[1];
  console.log(pp.firstChild.nodeValue);
	if (pp.firstChild.nodeValue == "Show Reference"){
		pp.firstChild.nodeValue = "Hide Reference";
		//ref_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Reference"){
		pp.firstChild.nodeValue = "Show Reference";
		//ref_flag = 0;
	}
	else alert("error");
	//redraw();
}

function showbldlink(){
	var pp = document.getElementById("showalllink");
	pp = pp.children[0];
 console.log(pp.firstChild.nodeValue);
	if (pp.firstChild.nodeValue == "Show Build-on"){
		pp.firstChild.nodeValue = "Hide Build-on";
		//bld_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Build-on"){
		pp.firstChild.nodeValue = "Show Build-on";
		//bld_flag = 0;
	}
	else alert("error");
	//redraw();
}

function toggleNetworkGraphType(elem) {
  if (!elem) {
    console.log("Invalid html element");
    return;
  }
 
  if (!netGraph) {
    console.log("Invalid network graph");
    return;
  }
  
  if ($(elem).html() === "Cross-Thread Build-ons") {
    netGraph.setGraphTypeToCrossBuildons();
    $(elem).html("Common Notes Across Thread");
  } else if ($(elem).html() === "Common Notes Across Thread") {
    netGraph.setGraphTypeToCommonNoteCount();
    $(elem).html("Cross-Thread Build-ons");
  }
}