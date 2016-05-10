var bar_node = 5;
var draw_node_width = 10;
var draw_node_margin = 4;
var draw_node = draw_node_width+draw_node_margin*2;
var draw_width = 910;
var draw_width2 = draw_width-draw_node;
var draw_height = 120;
var time_width = 930;
var bar_width = 870;
var bar_width2 = bar_width-bar_node;
var bar_height = 40;
var title_flag = 0;
var ref_flag = 0;
var bld_flag = 0;
var ant_flag = 0;
var author_flag = 0;
var draw_pointer = 0;
var hlt_flag = 0;
var tg = null;
//var authorcnt;
function render(threadChanged){
	var root_raw = document.getElementById("raw_area");
	if (root_raw){
		initVis();
		if (threadChanged && threadChanged === "1") {
		  threadChanged = true;
		} else if (threadChanged && threadChanged === "0") {
		  threadChanged = false;
		}
		if (typeof threadChanged === 'boolean') {
		  OnSave(threadChanged);
		} else {
		  OnSave(false);
		}
	  initList();
	}
}

/**
 * @note Not used anymore 
 * 
 * @param e
 */
function bar(e){
	var minutes=1000*60;
	var hours=minutes*60;
	var days=hours*24;
	var week=days*7;
	var month=days*30;
	var tm = initTime();
	var all = parseDT(tm[1])-parseDT(tm[0]);
	if (all ==0){
		all = days;
	}
	e = bardecide(e,all);
	var bs;
	var pp = document.getElementById("pointer");
	switch(e){
		case 0:
			bs = Math.floor(days/all*bar_width);
			pp.style.width = bs+"px";
			break;
		case 1:
			bs = Math.floor(week/all*bar_width);
			pp.style.width = bs+"px";
			break;
		case 2:
			bs = Math.floor(week*2/all*bar_width);
			pp.style.width = bs+"px";
			break;
		case 3:
			bs = Math.floor(month/all*bar_width);
			pp.style.width = bs+"px";
			break;
		case 4:
			bs = Math.floor(days/all*bar_width);
			pp.style.width = bar_width+"px";
			break;

	}
	edgecheck();
	redraw();
}

/** 
 * @note Not used anymore
 */
function windowmoveleft(){
	var pp = document.getElementById("pointer");
	if (isNaN(parseInt(pp.style.left))) {pp.style.left = "0px";}
	var ll = parseInt(pp.style.left);
	pp.style.left = ll - parseInt(pp.style.width) + "px";
	edgecheck();
	redraw();
}

/** 
 * @note Not used anymore
 */
function windowmoveright(){
	var pp = document.getElementById("pointer");
	if (isNaN(parseInt(pp.style.left))) {pp.style.left = "0px";}
	var ll = parseInt(pp.style.left);
	pp.style.left = ll + parseInt(pp.style.width) + "px";
	edgecheck();
	redraw();
}

/** 
 * @note Not used anymore
 */
function redraw1() {
	var pp=document.getElementById("pointer");
	var ll;
	if (isNaN(parseInt(pp.style.left))) {ll = 0;}
	else {ll = parseFloat(pp.style.left);}
	var rr=ll+parseFloat(pp.style.width);
	ll = ll/bar_width;
	rr = rr/bar_width;
	e = initTime();
	var start = parseDT(e[0]);
	var end = parseDT(e[1]);
	var root_raw = document.getElementById("raw_area");
	var root_draw = document.getElementById("draw_area");
	var cdraw = root_draw.children.length;
	for (var i = 0; i < cdraw; i++){
		root_draw.removeChild(root_draw.children[0]);
	}
	
	var ch = draw_height/2;
	var craw = root_raw.children;
	var yyoffset = 0;
	var clraw = craw.length;
	if (clraw == 1){
		var rnode = craw[0];
		var ctime = parseDT(rnode.getAttribute("date"));
		var pt = (ctime-start)/(end-start);
		var title = rnode.children[3].firstChild.nodeValue;
		var nnode = document.createElement("div");
		nnode.setAttribute("drawnoteid",rnode.getAttribute("noteid"));
		nnode.setAttribute("class","drawnote");
		nnode.setAttribute("title",title);
		nnode.setAttribute("author",rnode.getAttribute("author"));
		root_draw.appendChild(nnode);
		var xoffset = draw_width2/2 + "px";
		var yoffset;
		if (yyoffset%2 == 0) yoffset = ch + yyoffset/2*draw_node + "px";
		else if(yyoffset%2 == 1) yoffset = ch - ((yyoffset+1)/2)*draw_node + "px";
		if (parseInt(yoffset) < 0 || (parseInt(yoffset)+draw_node) > draw_height){
			yoffset = ch + "px";
			yyoffset = 0;
		}
		nnode.style.left = xoffset;
		nnode.style.top = yoffset;
		yyoffset+=1;
		if(yyoffset >= draw_height/draw_node) yyoffset = 0;
		
	}
	else{

	for (var i = 0; i < clraw; i++){
		var rnode = craw[i];
		var ctime = parseDT(rnode.getAttribute("date"));
		var pt = (ctime-start)/(end-start);
		if (pt <= rr && pt >= ll){
		var title = rnode.children[3].firstChild.nodeValue;
		var nnode = document.createElement("div");
		nnode.setAttribute("drawnoteid",rnode.getAttribute("noteid"));
		nnode.setAttribute("class","drawnote");
		nnode.setAttribute("title",title);
		nnode.setAttribute("author",rnode.getAttribute("author"));
		root_draw.appendChild(nnode);
		var xoffset = Math.floor(((ctime-start)/(end-start)-ll)/(rr-ll)*draw_width2) + "px";
		var yoffset;
		if (yyoffset%2 == 0) yoffset = ch + yyoffset/2*draw_node + "px";
		else if(yyoffset%2 == 1) yoffset = ch - ((yyoffset+1)/2)*draw_node + "px";
		if (parseInt(yoffset) < 0 || (parseInt(yoffset)+draw_node) > draw_height){
			yoffset = ch + "px";
			yyoffset = 0;
		}
		nnode.style.left = xoffset;
		nnode.style.top = yoffset;
		yyoffset+=1;
		if(yyoffset >= draw_height/draw_node) yyoffset = 0;
		}
	}}
	//highlight part;
	highlightnotes();
	//flag part
	checkflag();
}

/** 
 * Initialize visualization
 * @see render
 */
function initVis() {
  /** @note Fix this */
//  var pp=document.getElementById("pointer");
//  var ll;
//  if (isNaN(parseInt(pp.style.left))) {ll = 0;}
//  else {ll = parseFloat(pp.style.left);}
//  var rr=ll+parseFloat(pp.style.width);
//  ll = ll/bar_width;
//  rr = rr/bar_width;
//  e = initTime();
//  var start = parseDT(e[0]);
//  var end = parseDT(e[1]);
  
  var root_raw = document.getElementById("raw_area");
  tg = new threadGraph($('#slider'));
//  var root_draw = document.getElementById("draw_area");
//  var cdraw = root_draw.children.length;
//  for (var i = 0; i < cdraw; i++){
//    root_draw.removeChild(root_draw.children[0]);
//  }
 
  //var ch = draw_height/2;
  var craw = root_raw.children;
  //var yyoffset = 0;
  var mainObject ={};
  var arr =[];
  
  var clraw = craw.length;
  
  if (clraw == 1){
    var rnode = craw[0];
    
    var ctime = parseDT(rnode.getAttribute("date"));
    var title = rnode.children[3].firstChild.nodeValue;
    var ct = rnode.children[4];
    var content = ct.innerHTML;
    var note_id = rnode.getAttribute("noteid");
    var author = rnode.getAttribute("author");
    var view = rnode.getAttribute("view");
    author = author.replace(/^\s+|\s+$/g,'');
    
    var nnode = document.createElement("div");
    nnode.setAttribute("drawnoteid",rnode.getAttribute("noteid"));
    nnode.setAttribute("class","drawnote");
    nnode.setAttribute("title",title);
    nnode.setAttribute("author",rnode.getAttribute("author"));
    nnode.setAttribute("view",view);
    nnode.setAttribute("content",content);
    
    var localObj = {};
    localObj["id"] = title;
    localObj["noteid"] = note_id; 
    localObj["author"] = author;
    localObj["time"] = ctime;
    localObj["view"] = view;
    localObj["content"] = content;
    localObj["highlight_state"] = rnode.getAttribute("highlight");
    
    arr[0] = localObj;
    mainObject.nodes = arr;
    mainObject.links = [];
    //console.log('mainObject.nodes',mainObject.nodes);
    tg.readData(mainObject);
    
    // Hide author labels
    tg.toggleAuthors();
    tg.toggleTitles();
    tg.toggleLinks(null, 'buildons');
    tg.toggleLinks(null, 'references');
    
    /** @note Fix this */
//    root_draw.appendChild(nnode);
//    var xoffset = draw_width2/2 + "px";
//    var yoffset;
//    if (yyoffset%2 == 0) yoffset = ch + yyoffset/2*draw_node + "px";
//      else if(yyoffset%2 == 1) yoffset = ch - ((yyoffset+1)/2)*draw_node + "px";
//    if (parseInt(yoffset) < 0 || (parseInt(yoffset)+draw_node) > draw_height){
//      yoffset = ch + "px";
//      yyoffset = 0;
//    }
//    nnode.style.left = xoffset;
//    nnode.style.top = yoffset;
//    yyoffset+=1;
//    if(yyoffset >= draw_height/draw_node) yyoffset = 0;
  }
  else{
    for (var i = 0; i < clraw; i++){
      var localObj = {};
      var rnode = craw[i];
      var ctime = parseDT(rnode.getAttribute("date"));
      var title = rnode.children[3].firstChild.nodeValue;
      var note_id = rnode.getAttribute("noteid");
      var author = rnode.getAttribute("author");
      var view = rnode.getAttribute("view");
      var ct = rnode.children[4];
      var content = ct.innerHTML;
      author = author.replace(/^\s+|\s+$/g,'');
      var nnode = document.createElement("div");
      nnode.setAttribute("drawnoteid",rnode.getAttribute("noteid"));
      nnode.setAttribute("class","drawnote");
      nnode.setAttribute("title",title);
      nnode.setAttribute("author",rnode.getAttribute("author"));
      nnode.setAttribute("view",view);
      nnode.setAttribute("content",content);
      //root_draw.appendChild(nnode);
      
      localObj["id"] = title;
      localObj["noteid"] = note_id; 
      localObj["author"] = author;
      localObj["time"] = ctime;
      localObj["view"] = view;
      localObj["content"] = content;
      localObj["highlight_state"] = rnode.getAttribute("highlight");
      arr[i] = localObj;
    }
    mainObject.nodes = arr;
  
    /* Testing code related to buildons*/
    var buildson_links = visualizeBuildson();
     
    var buildson_index = [];
   	//Check if the source-target exists and fetch the index 
  	for(var i = 0; i< buildson_links.length;++i)
     	{
  		var link_index ={};
       	var source_index = findIndexByNoteId(buildson_links[i].source,mainObject.nodes);
       	var target_index = findIndexByNoteId(buildson_links[i].target,mainObject.nodes);
       	if(source_index != -1 && target_index != -1) {
            //push the key value pair of indexes to the array.
           	link_index["source"] = source_index;
           	link_index["target"] = target_index;
            link_index["type"] = "buildons";
           	buildson_index.push(link_index);
  		}
  	}
  
    //mainObject.links = buildson_index;


    /* Testing code related to references*/
    var reference_links = visualizeReferences();
     
    var reference_index = [];
    //Check if the source-target exists and fetch the index 
    for(var i = 0; i< reference_links.length;++i)
      {
      var link_index ={};
        var source_index = findIndexByNoteId(reference_links[i].source,mainObject.nodes);
        var target_index = findIndexByNoteId(reference_links[i].target,mainObject.nodes);
        if(source_index != -1 && target_index != -1) {
            //push the key value pair of indexes to the array.
            link_index["source"] = source_index;
            link_index["target"] = target_index;
            link_index["type"] = "references";
            reference_index.push(link_index);
      }
    }
    
    mainObject.links = buildson_index.concat(reference_index); 
    //console.log('mainObject.links',mainObject);
    tg.readData(mainObject);
  
    // Hide author labels
    tg.toggleAuthors();
    tg.toggleTitles();
    
    tg.toggleLinks(null, 'buildons');
    tg.toggleLinks(null, 'references');
  }
  //console.log('mainObject.nodes',mainObject.nodes);
  // Highlight part;
  tg.toggleHighlightNodes();
}

/* Create an array of buildson
*/
function visualizeBuildson()
{
  var buildson_links = [];
  var parent = $('#raw_area');

  // This will give us notes
  var children = parent.children();

  // Each note has four childrens now (refernces, builds, ....)
  children.each(function() {
    
    // We get one note now
    var note = $(this);
    
    //console.log(note.attr('noteid'));
    //var grand_children_buildson = note.children($('buildson'));
    var grand_children = note.children();
    
    //console.log(grand_children);
    var great_grand_children = grand_children.children('div.buildson');
    
    //console.log('great_grand_children ', great_grand_children);
    great_grand_children.each(function() {
    var buildson = $(this);
    
   // if ( typeof buildson.attr('target') == 'String') {
      
        var link = {};
        link["source"] = note.attr('noteid');
        link["target"] = buildson.attr('target');
        buildson_links.push(link);
        //console.log('link.source'+ buildson_links[0].source);
        //console.log('link.target'+ buildson_links[0].target);
        //console.log('link.length'+ buildson_links.length);
        //console.log(buildson_links);
      //}
    });

  });

  return buildson_links;
}


/**
 * Create an array of references
 */
function visualizeReferences() {
  
  var reference_links = [];
  
  var parent = $('#raw_area');

  // This will give us notes
  var children = parent.children();
  //console.log(children);
  // Each note has four childrens now (refernces, builds, ....)
  children.each(function() {
    // We get one note now
    var note = $(this);
    //console.log(note.attr('noteid'));
    //var grand_children_reference = note.children($('references'));
    var grand_children = note.children();

    //console.log(grand_children);
    var great_grand_children = grand_children.children('div.reference');
    
    //console.log('great_grand_children ', great_grand_children);
    great_grand_children.each(function() {
      var reference = $(this);
      //console.log('target', reference.attr('target'));
        
      var link = {};
      link["source"] = note.attr('noteid');
      link["target"] = reference.attr('target');
      reference_links.push(link);
    });
  });

  return reference_links;
}

/**
 * Find if noteid present in the main object array
 */
function findIndexByNoteId(noteid, mainObject_nodes) {
  for(var i = 0; i < mainObject_nodes.length; i++ ) {
      if(noteid == mainObject_nodes[i].noteid) {
         return i;
      }
  }
  return -1;
}

/** 
 * 
 */
function highlightnotes() {
	var root_list = document.getElementById("list_area").children[0];
	var root_draw = document.getElementById("draw_area");
	for (var i=0;i< root_list.children.length;i++){
		if (root_list.children[i].getAttribute("class") == "hl"){
			var noteid = root_list.children[i].getAttribute("noteid");
			for (var j=0;j<root_draw.children.length;j++){
				if (root_draw.children[j].getAttribute("drawnoteid") == noteid)
					root_draw.children[j].setAttribute("class","hl_drawnote");
			}
		}
	}
	if (list_pointer = document.getElementById("list_pointer")){
		noteid = list_pointer.getAttribute("noteid");
		for (var j=0;j<root_draw.children.length;j++){
			if (root_draw.children[j].getAttribute("drawnoteid") == noteid)
				root_draw.children[j].setAttribute("id","draw_pointer");
		}
	}
}


function highlightstate() {
  var hlt = document.getElementById("showhighlight");
  hlt = hlt.children[0];
  var item = document.getElementById("list_pointer");
  if(item.getAttribute("class") === "hl") {
    hlt.firstChild.nodeValue = "Remove Highlight";
  } else {
    hlt.firstChild.nodeValue = "Highlight Note";
  }
}

/** 
 * @note Fix highlight  not used anymore
 */
function highlightstate1()
{ 
  return;
  
  var hlt = document.getElementById("showhighlight");
  hlt = hlt.children[0];
  if(draw_pointer == 1)
  {
        var root_list = document.getElementById("list_area").children[0];
        var draw_pp = document.getElementById("draw_pointer").getAttribute("drawnoteid");
        if(document.getElementById("draw_pointer").getAttribute("class") == "hl_drawnote")
        {
            
            for (var i=0;i<root_list.children.length;i++){
            if (root_list.children[i].getAttribute("noteid") == draw_pp)
            {
                if(root_list.children[i].getAttribute("class") == "hl")
                {
                  hlt.firstChild.nodeValue = "Remove Highlight";
                }
                else
                {
                  hlt.firstChild.nodeValue = "Highlight Note";
                }
             }
           }
         }
        if(document.getElementById("draw_pointer").getAttribute("class") == "drawnote")
        {
          for (var i=0;i<root_list.children.length;i++)
          {
            if (root_list.children[i].getAttribute("noteid") == draw_pp)
            {
              hlt.firstChild.nodeValue = "Highlight Note";
            }
          }
        }
   }
   else( "None note Selected.....");
}

/** 
 * @note Fix this
 */
function showhighlight(alertNoNote)
{
  //return;
  var item = document.getElementById("list_pointer");
  if(item)
  {
    var hlt = document.getElementById("showhighlight");
    hlt = hlt.children[0];
    console.log("hlt",hlt.firstChild.nodeValue);
   
    if(hlt.firstChild.nodeValue == "Highlight Note")
    {
      hl_note(1,alertNoNote);
      hlt.firstChild.nodeValue = "Remove Highlight";
      hlt_flag = 1;
      OnSave(true);
    }
    else if(hlt.firstChild.nodeValue == "Remove Highlight")
    {
      hl_note(0,alertNoNote);
      hlt.firstChild.nodeValue = "Highlight Note";
      hlt_flag = 0;
      OnSave(true);
    }
    
    //OnSave(true);
  }
  else
  {
    if(alertNoNote)
    {
      $(alertNoNote).dialog();
    }
  }
}

/** 
 * 
 */
function checkflag() {
	//clean up links
	var tmplayer = document.getElementById("reference_area");
	var tmpcnt = tmplayer.children.length;
	for (var i = 0; i < tmpcnt;i++){
		tmplayer.removeChild(tmplayer.children[0]);
	}
	tmplayer = document.getElementById("buildon_area");
	tmpcnt = tmplayer.children.length;
	for (var i = 0; i < tmpcnt;i++){
		tmplayer.removeChild(tmplayer.children[0]);
	}
	tmplayer = document.getElementById("annotate_area");
	tmpcnt = tmplayer.children.length;
	for (var i = 0;i < tmpcnt;i++){
		tmplayer.removeChild(tmplayer.children[0]);
	}
	if (title_flag == 1){
		var root_draw = document.getElementById("draw_area");
		for (var i = 0; i < root_draw.children.length; i++){
			dnode = root_draw.children[i];
			var dv = document.createElement("div");
			dv.setAttribute("class","drawtitle");
			var ttl = dnode.getAttribute("title");
			ttl = document.createTextNode(ttl);
			dnode.appendChild(dv);
			dv.appendChild(ttl);
		}
	}
	
	if (ref_flag == 1){
		var root_draw = document.getElementById("draw_area");
		for (var i = 0; i < root_draw.children.length;i++){
			drawsinglelink_ref(root_draw.children[i].getAttribute("drawnoteid"));
		}
	}
	if (bld_flag == 1){
		var root_draw = document.getElementById("draw_area");
		for (var i = 0; i < root_draw.children.length;i++){
			drawsinglelink_bld(root_draw.children[i].getAttribute("drawnoteid"));
		}
	}
	if (ant_flag == 1){
		var root_draw = document.getElementById("draw_area");
		for (var i = 0; i < root_draw.children.length;i++){
			drawsinglelink_ant(root_draw.children[i].getAttribute("drawnoteid"));
		}
	}
	if (author_flag == 1){
		var root_draw = document.getElementById("draw_area");
		for (var i = 0; i < root_draw.children.length; i++){
			dnode = root_draw.children[i];
			var dv = document.createElement("div");
			dv.setAttribute("class","drawauthor");
			var ttl = dnode.getAttribute("author");
			ttl = document.createTextNode(ttl);
			dnode.appendChild(dv);
			dv.appendChild(ttl);
		}
	}
}

/** 
 * 
 * @param id
 */
function drawsinglelink_ant(id) { 
	//input "noteid"
	//fint current note
	var root_raw = document.getElementById("raw_area").children;
	var cnt = root_raw.length;
	for (var i = 0; i < cnt; i++){
		if (root_raw[i].getAttribute("noteid") == id){
			cnt = i;
			break;
		}
	}
	//find referrences
	root_raw = root_raw[cnt];
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
		if (checkn2d(tnode) == 1){
			//target in draw_area
			drawlink(id,tnode,"ant");
		}
	}
}

/** 
 * 
 * @param id
 */
function drawsinglelink_bld(id) {
	//input "noteid"
	//fint current note
	var root_raw = document.getElementById("raw_area").children;
	var cnt = root_raw.length;
	for (var i = 0; i < cnt; i++){
		if (root_raw[i].getAttribute("noteid") == id){
			cnt = i;
			break;
		}
	}
	//find referrences
	root_raw = root_raw[cnt];
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
		if (checkn2d(tnode) == 1){
			//target in draw_area
			drawlink(id,tnode,"bld");
		}
	}
}

/** 
 * 
 * @param id
 */
function drawsinglelink_ref(id) {
	//input "noteid"
	//fint current note
	var root_raw = document.getElementById("raw_area").children;
	var cnt = root_raw.length;
	for (var i = 0; i < cnt; i++){
		if (root_raw[i].getAttribute("noteid") == id){
			cnt = i;
			break;
		}
	}
	//find referrences
	root_raw = root_raw[cnt];
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
		if (checkn2d(tnode) == 1){
			//target in draw_area
			drawlink(id,tnode,"ref");
		}
	}
}

/** 
 * 
 * @param id
 * @param tnode
 * @param type
 */
function drawlink(id,tnode,type) {
	var root_draw = document.getElementById("draw_area");
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
			drawlink_ref([srcnodex,srcnodey],[tgtnodex,tgtnodey]);
			break;
		case "bld":
			drawlink_bld([srcnodex,srcnodey],[tgtnodex,tgtnodey]);
			break;
		case "ant":
			drawlink_ant([srcnodex,srcnodey],[tgtnodex,tgtnodey]);
			break;
		default:
			alert("none available link_area" + type);
	}
}

/** 
 * 
 */
function drawlink_ant(srcnode,tgtnode) {
	var layer = document.getElementById("annotate_area");
	if (srcnode[1] == tgtnode[1]){
		//on same y level, straight line
		if (((tgtnode[0] - srcnode[0])>draw_node_width)&&((tgtnode[0]-srcnode[0])<=(draw_node_width+draw_node_margin+2))){
			var line = document.createElement("div");
			line.setAttribute("class","ant_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-(srcnode[0]+draw_node_width)+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+7+"px";
			line.style.left = srcnode[0]+draw_node_width+"px";
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
		if (tgtnode[0]-srcnode[0]< draw_node_width+draw_node_margin*2){
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
		else if (tgtnode[0]-srcnode[0] == draw_node_width+draw_node_margin*2){
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
		else if (tgtnode[0]-srcnode[0] > draw_node_width+draw_node_margin*2){
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
		if (tgtnode[0]-srcnode[0]< draw_node_width+draw_node_margin*2){
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
		else if (tgtnode[0]-srcnode[0] == draw_node_width+draw_node_margin*2){
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
		else if (tgtnode[0]-srcnode[0] > draw_node_width+draw_node_margin*2){
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

/* 
 * 
 */
function drawlink_bld(srcnode,tgtnode) {
	var layer = document.getElementById("buildon_area");
	if (srcnode[1] == tgtnode[1]){
		//on same y level, straight line
		if (((tgtnode[0] - srcnode[0])>draw_node_width)&&((tgtnode[0]-srcnode[0])<=(draw_node_width+draw_node_margin+2))){
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-(srcnode[0]+draw_node_width)+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('../img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//on same y level, need top space
		else if ((tgtnode[0] - srcnode[0])>(draw_node_width+draw_node_margin)){
			//end to srcnode '-'
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "9px";
			line.style.top = srcnode[1]-4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+4+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-srcnode[0]-draw_node_width-4-1-1-3+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]-4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+4+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "9px";
			line.style.top = srcnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
	}
	if (srcnode[1] < tgtnode[1]){
		//2 shape
		if (tgtnode[0]-srcnode[0]< draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-3)-(srcnode[1]+4)+"px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+4)-(tgtnode[0]-3)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "9px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]+5)-(srcnode[1]+4)+"px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//z shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (tgtnode[1]-3)-(srcnode[1]+4)+"px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-3-1)-(srcnode[0]+4+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+4+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "9px";
			line.style.top = tgtnode[1]-4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
	}
	if (srcnode[1] > tgtnode[1]){
		//s shape
		if (tgtnode[0]-srcnode[0]< draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+5)-(tgtnode[1]+draw_node_width+4)+"px";
			line.style.top = tgtnode[1]+draw_node_width+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+4)-(tgtnode[0]-3)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "11px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+5)-(tgtnode[1]+4)+"px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//reversed 3 shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "4px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+5)-(tgtnode[1]+draw_node_width+4)+"px";
			line.style.top = tgtnode[1]+draw_node_width+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-3-1)-(srcnode[0]+4+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+4+draw_node_margin+"px";
			line.style.left = srcnode[0]+4+1+draw_node_width+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "11px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3-1+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","bld_line");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+4+draw_node_margin+"px";
			line.style.left = tgtnode[0]-3+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","bld_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_blue.gif')|none|inherit";
			line.style.top = srcnode[1]+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
	}
}

/** 
 * 
 */
function drawlink_ref(srcnode,tgtnode) {
	var layer = document.getElementById("reference_area");
	if (srcnode[1] == tgtnode[1]){
		//on same y level, straight line
		if (((tgtnode[0] - srcnode[0])>draw_node_width)&&((tgtnode[0]-srcnode[0])<=(draw_node_width+draw_node_margin+2))){
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-(srcnode[0]+draw_node_width)+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+"px";
			line.style.left = srcnode[0]+draw_node_width+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//on same y level, need top space
		else if ((tgtnode[0] - srcnode[0])>(draw_node_width+draw_node_margin)){
			//end to srcnode '-'
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
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
			line.style.left = srcnode[0]+draw_node_width+2+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = tgtnode[0]-srcnode[0]-draw_node_width-2-1-1-5+"px";
			line.style.height = "1px";
			line.style.top = srcnode[1]-6+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+2+1+draw_node_margin+"px";
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
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
	}
	if (srcnode[1] < tgtnode[1]){
		//2 shape
		if (tgtnode[0]-srcnode[0]< draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
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
			line.style.left = srcnode[0]+2+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+2)-(tgtnode[0]-5)+"px";
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
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
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
			line.style.left = srcnode[0]+2+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//z shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
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
			line.style.left = srcnode[0]+2+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-5-1)-(srcnode[0]+2+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]-6+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+2+1+draw_node_margin+"px";
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
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
	}
	if (srcnode[1] > tgtnode[1]){
		//s shape
		if (tgtnode[0]-srcnode[0]< draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+2)-(tgtnode[1]+draw_node_width+2)+"px";
			line.style.top = tgtnode[1]+draw_node_width+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+2+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (srcnode[0]+draw_node_width+2)-(tgtnode[0]-5)+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+2+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "12px";
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
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//straight down
		else if (tgtnode[0]-srcnode[0] == draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
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
			line.style.left = srcnode[0]+2+draw_node_width+draw_node_margin+"px";
			//start to tgtnode
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "5px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+1+draw_node_margin+"px";
			line.style.left = tgtnode[0]-5+draw_node_margin+"px";
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
		//reversed 3 shape
		else if (tgtnode[0]-srcnode[0] > draw_node_width+draw_node_margin*2){
			//end to srcnode
			var line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "2px";
			line.style.height = "1px";
			line.style.top = srcnode[1]+1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
			//I to end
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = (srcnode[1]+2)-(tgtnode[1]+draw_node_width+2)+"px";
			line.style.top = tgtnode[1]+draw_node_width+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+2+draw_node_width+draw_node_margin+"px";
			//long line "I-I"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = (tgtnode[0]-5-1)-(srcnode[0]+2+1)-draw_node_width+"px";
			line.style.height = "1px";
			line.style.top = tgtnode[1]+draw_node_width+2+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+2+1+draw_node_margin+"px";
			//I to start "I to -"
			line = document.createElement("div");
			line.setAttribute("class","ref_line");
			layer.appendChild(line);
			line.style.width = "1px";
			line.style.height = "12px";
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
			//arrow
			line = document.createElement("div");
			line.setAttribute("class","ref_arrow");
			layer.appendChild(line);
			line.style.width = "3px";
			line.style.height = "5px";
			line.style.backgroundImage="url('img/linearrow_black.gif')|none|inherit";
			line.style.top = srcnode[1]-1+draw_node_margin+"px";
			line.style.left = srcnode[0]+draw_node_width+draw_node_margin+"px";
		}
	}
}

/** 
 * 
 */
function checkn2d(tnode) {
	var root_draw = document.getElementById("draw_area");
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

/** 
 * 
 */
function edgecheck() {
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

/**
 * 
 * @param e
 * @param all
 * @returns
 */
function bardecide(e,all) { 
	var minutes=1000*60;
	var hours=minutes*60;
	var days=hours*24;
	var week=days*7;
	var month=days*30;
	var result;
	switch (e){
		case 0: 	
			if (all<days) result = 4;
			else result = e;
			break;
		case 1:
			if (all<week) result = 4;
			else result = e;
			break;
		case 2:
			if (all<week*2) result = 4;
			else result = e;
			break;
		case 3:
			if (all<month) result = 4;
			else result = e;
			break;
		case 4:
			result = 4;

	}
	return result;
}

/** 
 * 
 * @param e
 */
function initBar(e) {
	var start = parseDT(e[0]);
	var end = parseDT(e[1]);
	var root_raw = document.getElementById("raw_area");
	var root_bar = document.getElementById("bar");
	var ch = 0;
	var craw = root_raw.children;
	var clraw = craw.length;
	for (var i = 0; i < clraw; i++){
		var rnode = craw[i];
		var nnode = document.createElement("div");
		nnode.setAttribute("barnoteid",rnode.getAttribute("noteid"));
		nnode.setAttribute("class","barnote");
		root_bar.appendChild(nnode);
		var ctime = parseDT(rnode.getAttribute("date"));
		var xoffset = (ctime-start)/(end-start)*bar_width2 + "px";
		var yoffset = ch+"px";
		nnode.style.left = xoffset;
		nnode.style.top = yoffset;
		ch += bar_node;
		if(ch >= bar_height) ch = 0;
	}	
}

/** 
 * 
 */
function initPointer() {
	var pp = document.getElementById("pointer");
}

/**
 * 
 */

function updateAuthorCount() {
  $.ajax({
    type: "POST",
    async: false,
    url: "/ITM/AuthorCount",
    data: { 
      threadname:_threadfocus, 
      projectname:_projectname, 
      project_id: projectid
    },
    success: function(response) {
      authorcnt = response;
    },
    failure: function(response) {
      console.log('Failed to get author count');
    }
  });
}

/**
 * 
 */
function initList() {
	//init list
	console.log('initList');
	var root_list = document.getElementById("list_area");
	var root_ul = document.createElement("ul");
	root_list.appendChild(root_ul);
	var root_raw = document.getElementById("raw_area");
	var croot = root_raw.children;
	var clength = croot.length;
	
	for (var i = 0; i < clength; i++)
	{
		var tmpli = document.createElement("li");
		var noteid = croot[i].getAttribute("noteid");
		var notetitle = croot[i].children[3].firstChild;
		tmpli.appendChild(notetitle.cloneNode(false));
		var highlight_state = croot[i].getAttribute("highlight");
		tmpli.setAttribute("noteid",noteid);
		if (highlight_state === "1")
		{
			tmpli.setAttribute("class","hl");
			tg.toggleHighlightNode(tmpli);
		}
		//console.log(highlight_state);
		
		root_ul.appendChild(tmpli);
	}
	updateAuthorCount();
	var root_info = document.getElementById("threadinfo");
	root_info.appendChild(document.createTextNode("This thread includes "+clength+" note(s) by "+ authorcnt +" author(s) from  "+ min_range + " to  "+ max_range));
	root_info.style.font = "bold 12px Arial";
}

/**
 * 
 * @param e
 */
function initTimeline(e) {
	var root_time = document.getElementById("time_area");
	var split = 7;
	var start = newDT(e[0]);
	var end = newDT(e[1]);
	var starttime = parseDT(e[0]);
	var endtime = parseDT(e[1]);
	var tp = (endtime-starttime)/split;
	var tnode = document.createElement("div");
	tnode.setAttribute("class","timenode");
	tnode.appendChild(document.createTextNode((start.getMonth()+1)+"/"+(start.getDate())+"/"+start.getFullYear()));
	tnode.style.left="0px";
	root_time.appendChild(tnode);
	for (var i = 1; i < split; i++){
		var nd = new Date();
		nd.setTime(0-nd.getTime());
		nd.setTime(start);
		var dateoffset = tp*i+starttime;
		nd.setTime(dateoffset);
		var ttnode = document.createElement("div");
		ttnode.setAttribute("class","timenode");
		ttnode.appendChild(document.createTextNode((nd.getMonth()+1)+"/"+(nd.getDate())));
		ttnode.style.left = bar_width/split*i+20 + "px";
		root_time.appendChild(ttnode);
	}
	var enode = document.createElement("div");
	enode.setAttribute("class","timenode");
	enode.appendChild(document.createTextNode((end.getMonth()+1)+"/"+(end.getDate())+"/"+end.getFullYear()));
	enode.style.left=time_width - 60 + "px";
	root_time.appendChild(enode);
}

/**
 * 
 * @returns {Array}
 */
function initTime() {
	var el = document.getElementById("raw_area");
	var firsttime;
	var lasttime;
	var rchildren = el.children;
	var rlength = el.children.length;
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

/**
 * 
 * @param str1
 * @param str2
 * @returns
 */
function compareDate(str1,str2) {
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
var _startX = 0;            // mouse starting positions
var _offsetX = 0;           // current element offset
var _dragElement;           // pass the element
var _moving = 0;
var _blockwidth = bar_width;

/**
 * 
 * @param e
 */
function ptdown(e) {
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

/**
 * E9F4B4 B1B793  8E9F3B  F1FAC9  F3FAD6
 * @param e
 */
function ptmove(e) {
	e = e ? e : window.event;
	_dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
	if (parseInt(_dragElement.style.left) < 0) {_dragElement.style.left = "0px";}
	if (parseInt(_dragElement.style.left) > (bar_width - _blockwidth)) {_dragElement.style.left = (bar_width - _blockwidth)+"px";}
}

/**
 * 
 * @param e
 */
function ptup(e) {
	e = e ? e : window.event;
	document.onmousemove = null;
	document.onmouseup = null;
	document.onselectstart = null;
	_dragElement = null;
	_moving = 0;
	redraw();
}

/**
 * 
 */
function showalltitle() {
	pp = pp.children[0];
	if (pp.firstChild.nodeValue == "Show Title"){
		pp.firstChild.nodeValue = "Hide Title";
		title_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Title"){
		pp.firstChild.nodeValue = "Show Title";
		title_flag = 0;
	}
	else alert("error");
	redraw();
}

/**
 * 
 */
function showreflink() {
	var pp = document.getElementById("showalllink");
	pp = pp.children[1];
	if (pp.firstChild.nodeValue == "Show Reference"){
		pp.firstChild.nodeValue = "Hide Reference";
		ref_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Reference"){
		pp.firstChild.nodeValue = "Show Reference";
		ref_flag = 0;
	}
	else alert("error");
	redraw();
}

/**
 * 
 */
function showbldlink() {
	var pp = document.getElementById("showalllink");
	pp = pp.children[0];
	if (pp.firstChild.nodeValue == "Show Build-on"){
		pp.firstChild.nodeValue = "Hide Build-on";
		bld_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Build-on"){
		pp.firstChild.nodeValue = "Show Build-on";
		bld_flag = 0;
	}
	else alert("error");
	redraw();
}

/**
 * 
 */
function showantlink() {
	var pp = document.getElementById("showalllink");
	pp = pp.children[2];
	if (pp.firstChild.nodeValue == "Show Annotate"){
		pp.firstChild.nodeValue = "Hide Annotate";
		ant_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Annotate"){
		pp.firstChild.nodeValue = "Show Annotate";
		ant_flag = 0;
	}
	else alert("error");
	redraw();
}

/**
 * @note used anymore
 */
function showallauthor() {
	var pp = document.getElementById("showallauthor");
	pp = pp.children[0];
	if (pp.firstChild.nodeValue == "Show Author"){
		pp.firstChild.nodeValue = "Hide Author";
		author_flag = 1;
	}
	else if (pp.firstChild.nodeValue == "Hide Author"){
		pp.firstChild.nodeValue = "Show Author";
		author_flag = 0;
	}
	else alert("error");
	redraw();
}

/** 
 * @note Old notes
 * 
 * @param e
 */
function showlink(e) {
	var item;
	e = e ? e : window.event;
	//if (!e) var e = window.event;
	if (e.target) item = e.target;
	var drawlink = document.getElementById("drawlink");
	if (item.getAttribute("class") == "note"){
		//show references
		var drawreference = document.createElement("div");
		drawlink.appendChild(drawreference);
		drawreference.style.width = "100%";
		var referchild = searchNode(item,"class","references");
		for (var i = 0; i < referchild.children.length; i++){
			var currentlink = document.createElement("div");
			drawreference.appendChild(currentlink);
			currentlink.style.width = "100%";
			var curr = referchild.children[i]
			var targ = curr.getAttribute("target");
			targ = document.getElementById(targ);
			curr = item;
			var currl = curr.parentNode;
			var targl = targ.parentNode;
			var currleft;
			if (curr.style.left.indexOf("%") == -1){
				currleft = 0;
			}
			else currleft = parseFloat(curr.style.left);
			//
			var targleft;
			if (targ.style.left.indexOf("%") == -1){
				targleft = 0;
			}
			else targleft = parseFloat(targ.style.left);
			//get width of the link
			var wi = Math.abs(targleft - currleft);
			//get height of the link
			var hei;
			currl = getChildPos(currl.parentNode,currl);
			targl = getChildPos(targl.parentNode,targl);
			hei = Math.abs(currl - targl);
			hei = hei * 60;
			if (currl > targl){
				drawReBu(currentlink,curr,wi,hei);
			}
			else if (currl < targl){
				drawReUb(currentlink,curr,wi,hei);
			}
			else if (currl = targl){
				drawRePl(currentlink,curr,wi,hei);
			}
		}
	}
}
		
/** 
 * Select a item from the list
 * 
 * @param e
 */
function selectListItem(e) {      
  
  var item = null;
  var selectedListItem = document.getElementById("list_pointer");
  if (!e) var e = window.event;
  if (e.target) item = e.target;
  if (item.tagName.toLowerCase() == "li"){
    if (item.getAttribute("noteid") === "list_pointer") {
      item.setAttribute("id","");
    }
    else {
      if (selectedListItem !== null) {
        selectedListItem.setAttribute("id", "");
        tg.toggleSelectNode(selectedListItem);
      }
      
      item.setAttribute("id","list_pointer");
      tg.toggleSelectNode(item);
    }
  }
  open_note();
  highlightstate();
}


/** 
 * Select a item from the graph
 * 
 * @param e
 */
function selectGraphItem(note_id) {
  var list = document.getElementById("list_area");
  list = list.children[0];
  for(var i=0; i<list.children.length;i++)
  {
    if(list.children[i].getAttribute("noteid") == note_id)
    {
      list.children[i].setAttribute("id","list_pointer");
    }
    else 
    {
      list.children[i].setAttribute("id","");
    }
    
  }
  open_note();
}

/** 
 * @deprecated @see selectListItem
 * 
 * @param e
 */
function listclick(e) {
	var item;
	if (!e) var e = window.event;
	if (e.target) item = e.target;
	if (item.tagName.toLowerCase() == "li"){
		if (draw_pointer ==0){
			item.setAttribute("id","list_pointer");
			var root_raw = document.getElementById("raw_area");
			for (var i=0;i<root_raw.children.length;i++){
				if (root_raw.children[i].getAttribute("noteid") == item.getAttribute("noteid")){
					var dt = root_raw.children[i].getAttribute("date");
					dt = parseDT(dt);
					var tline = initTime();
					var start = parseDT(tline[0]);
					var end = parseDT(tline[1]);
					var ofset = Math.floor((dt-start)/(end-start)*870);
//					var pt = document.getElementById("pointer");
//					pt.style.left = ofset-parseInt(pt.style.width)/2+"px";
//					edgecheck();
					tg.draw();
					break;
				}
			}
			var root_draw = document.getElementById("draw_area");
			for (var i=0;i<root_draw.children.length;i++){
				if (root_draw.children[i].getAttribute("drawnoteid") == item.getAttribute("noteid")){
					root_draw.children[i].setAttribute("id","draw_pointer");
					break;
				}
			}
			draw_pointer = 1;
		}
		else if (draw_pointer == 1){
			if (document.getElementById("draw_pointer")){
				document.getElementById("draw_pointer").removeAttribute("id");
			}
			list_pointer_elem = document.getElementById("list_pointer");
			
			if(list_pointer_elem != null)
			{
				list_pointer_elem.removeAttribute("id");
			}
			
			item.setAttribute("id","list_pointer");
			
			var root_raw = document.getElementById("raw_area");
			for (var i=0;i<root_raw.children.length;i++){
				if (root_raw.children[i].getAttribute("noteid") == item.getAttribute("noteid")){
					var dt = root_raw.children[i].getAttribute("date");
					dt = parseDT(dt);
					var tline = initTime();
					var start = parseDT(tline[0]);
					var end = parseDT(tline[1]);
					var ofset = Math.floor((dt-start)/(end-start)*870);
//					var pt = document.getElementById("pointer");
//					pt.style.left = ofset-parseInt(pt.style.width)/2+"px";
//					edgecheck();
					tg.draw();
					break;
				}
			}
			var root_draw = document.getElementById("draw_area");
			for (var i=0;i<root_draw.children.length;i++){
				if (root_draw.children[i].getAttribute("drawnoteid") == item.getAttribute("noteid")){
					root_draw.children[i].setAttribute("id","draw_pointer");
					break;
				}
			}
		}
		else alert("error draw_pointer");
	}
	else if(draw_pointer == 1){
		draw_pointer_elem = document.getElementById("draw_pointer");
		if(draw_pointer_elem != null)
		{
			draw_pointer_elem.removeAttribute("id");
		}
		
		list_pointer_elem = document.getElementById("list_pointer");
		if(list_pointer_elem != null)
		{
			list_pointer_elem.removeAttribute("id");
		}
		draw_pointer = 0;
	}
	open_note();
	highlightstate();
}

function drawnoteclick(e) {
	var item;
	if (!e) var e = window.event;
	if (e.target) item = e.target;
	if (item.getAttribute("class") == "drawnote" || item.getAttribute("class") == "hl_drawnote"){
		if (draw_pointer ==0){
			item.setAttribute("id","draw_pointer");
			var list = document.getElementById("list_area");
			list=list.children[0];
			for (var i=0;i<list.children.length;i++){
				if (list.children[i].getAttribute("noteid") == item.getAttribute("drawnoteid")){
					list.children[i].setAttribute("id","list_pointer");
					break;
				}
			}
			draw_pointer = 1;
		}
		else if (draw_pointer == 1){
			if (document.getElementById("draw_pointer")){
				document.getElementById("draw_pointer").removeAttribute("id");
			}
			
			if(document.getElementById("list_pointer") != null)
			{
				document.getElementById("list_pointer").removeAttribute("id");
			}
			
			item.setAttribute("id","draw_pointer");
			var list = document.getElementById("list_area");
			list=list.children[0];
			for (var i=0;i<list.children.length;i++){
				if (list.children[i].getAttribute("noteid") == item.getAttribute("drawnoteid")){
					list.children[i].setAttribute("id","list_pointer");
					break;
				}
			}
		}
		else alert("error draw_pointer");
	}
	else if(draw_pointer == 1){
		if(document.getElementById("draw_pointer") != null)
		{
			document.getElementById("draw_pointer").removeAttribute("id");	
		}
		
		if(document.getElementById("list_pointer") != null)
		{
			document.getElementById("list_pointer").removeAttribute("id");
		}
		
		draw_pointer = 0;
	}
	open_note();
	highlightstate();
}

function open_note() {
	//if (draw_pointer == 1){
		var root_raw = document.getElementById("raw_area");
		var noteid = document.getElementById("list_pointer").getAttribute("noteid");
		var crt;
		for (var i = 0; i < root_raw.children.length;i++){
			if (root_raw.children[i].getAttribute("noteid")==noteid){
				crt = root_raw.children[i];
				break;
			}
		}
		var cnttitle;
		for (var i = 0; i< crt.children.length; i++){
			if (crt.children[i].getAttribute("class") == "rawtitle"){
				cnttitle = crt.children[i].firstChild;
				break;
			}
		}
		var cntcontent;
		for (var i = 0; i< crt.children.length; i++){
			if (crt.children[i].getAttribute("class") == "rawcontent"){
				//cntcontent = crt.children[i].firstChild;
				cntcontent = crt.children[i].innerHTML;
				break;
			}
		}
		
		/*var cntattachment;
		for (var i = 0; i< crt.children.length; i++){
			if (crt.children[i].getAttribute("class") == "attachment"){
				cntattachment = crt.children[i].innerHTML;
				break;
			}
		}*/
		
//		cntattachment = '<a href="#">Attachment link</a>';
		
		var cntview = crt.getAttribute("view");
		//alert(cntview);
		var cntauthor = crt.getAttribute("author");
		//alert(cntauthor);
		var cntdate = crt.getAttribute("date");
		//alert(cntdate);
		// clean it
		var note_area = document.getElementById("note_content");
		//alert(note_content);
		while(note_area.children.length != 0){
			note_area.removeChild(note_area.children[0]);
		}
		// fill in content
		var tmpcnt = document.createTextNode(cnttitle.data+"  (View:"+cntview+")");
		var tmpnot = document.createElement("h3");
		tmpnot.appendChild(tmpcnt);
		note_area.appendChild(tmpnot);
		
		tmpcnt = document.createTextNode("By: "+cntauthor+"      At : "+cntdate.substr(0,16));
		tmpnot = document.createElement("h4");
		tmpnot.appendChild(tmpcnt);
		note_area.appendChild(tmpnot);
		
		var wrapper= document.createElement('div');
		var notecontent = document.createElement("p");
		notecontent.innerHTML = cntcontent;
		wrapper.appendChild(notecontent);
	
		note_area.appendChild(wrapper);	
	//}
}


/*
 * Remove note from list and graph
*/
function remove_note(alertNoNote)
{
  //set the change of action to 1
  $( "#thread_change_state" ).data( "changed", 1 );
  
   var root_raw = document.getElementById("raw_area");
   var root_list = document.getElementById("list_area").children[0];
  
   var list_p = document.getElementById("list_pointer");
   
   if(list_p)
   {
   var list_pp = document.getElementById("list_pointer").getAttribute("noteid");
   console.log('list_pp'+list_pp);
   
   for(var i=0; i<root_raw.children.length;i++)
   {
     if(root_raw.children[i].getAttribute("noteid") == list_pp)
     {
         root_raw.removeChild(root_raw.children[i]);
     }
   }
   
   for (var i=0; i<root_list.children.length;i++) {
     if(root_list.children[i].getAttribute("noteid") == list_pp)
     {
       root_list.removeChild(root_list.children[i]);
     }
   }
   
   // Drop last visualization
   $('#thread_vis').html('');
   
   var root_info = document.getElementById("threadinfo");
   root_info.removeChild(root_info.firstChild);
    
   if (root_raw.children.length != 0)
   {
     initVis();
     tg.draw();
     OnSave(true);
   }
   else
   {
     OnClose();
   }
   
   // Now update the author count
   updateAuthorCount();
   root_info.appendChild(document.createTextNode("This thread includes "+root_raw.children.length+" note(s) by "+ authorcnt +" author(s)"));
  }
   else
   {
     if(alertNoNote)
     {
       $(alertNoNote).dialog();
     }
   }
}


function remove_note1() {
	var root_raw = document.getElementById("raw_area");
	var root_list = document.getElementById("list_area").children[0];
	
	var draw_pp = document.getElementById("draw_pointer").getAttribute("drawnoteid");
	for (var i=0;i< root_raw.children.length;i++){
		if (root_raw.children[i].getAttribute("noteid") == draw_pp){
			root_raw.removeChild(root_raw.children[i]);
		}
	}
	for (var i=0;i<root_list.children.length;i++){
		if (root_list.children[i].getAttribute("noteid") == draw_pp){
			root_list.removeChild(root_list.children[i]);
		}
	}
	draw_pointer = 0;
	var root_info = document.getElementById("threadinfo");
	root_info.removeChild(root_info.firstChild);
	root_info.appendChild(document.createTextNode("This thread includes "+root_raw.children.length+" note(s) by "+ authorcnt +" author(s)"));
	if (root_raw.children.length != 0){
		redraw();
		OnSave();
	}
	else{
		OnClose();
		/*OnSave();
		top.window.location="threadLoad.jsp?database="+_database+"&projectname="+_projectname+"&threadfocus="+_threadfocus;*/
	}
}


function hl_note(do_highlight) {
  
  //set the change of action to 1
  $( "#thread_change_state" ).data( "changed", 1 );
  
  var item = document.getElementById("list_pointer");
  list = document.getElementById("raw_area");
  if(do_highlight === 1)
  {
    item.setAttribute("class", "hl");
    for (var i = 0; i < list.children.length;i++){
      if (list.children[i].getAttribute("noteid") === item.getAttribute("noteid")){
        list.children[i].setAttribute("highlight","1");
        tg.toggleHighlightNode(item);
        break;
      }
    }
  }
  else
  {
    for (var i = 0; i < list.children.length;i++){
      if (list.children[i].getAttribute("noteid") === item.getAttribute("noteid")){
        list.children[i].setAttribute("highlight","0");
        $(item).removeClass("hl");
        tg.toggleHighlightNode(item);
        break; 
      }
    }
  }
}


function hl_note11(do_highlight) {
	//if (draw_pointer == 1)
	//{	
		var crt = document.getElementById("draw_pointer");
		
		if (crt.getAttribute("class") == "drawnote" && do_highlight === 1)
		{
			crt.setAttribute("class","hl_drawnote");
			var list = document.getElementById("list_area");
			list=list.children[0];
			
			for (var i=0;i<list.children.length;i++){
				
				if (list.children[i].getAttribute("noteid") == crt.getAttribute("drawnoteid")){
					// Since we are highlighting this element, and color by id wins over by class, we 
					// remove the id
					list.children[i].setAttribute("class","hl");
					list.children[i].removeAttribute("id");
					
					// By removing this special id, we restore the item css attributes
					graph_item = document.getElementById("draw_pointer");
					if (graph_item != null) {
						graph_item.removeAttribute("id");
					}
					break;
				}
			}
			list = document.getElementById("raw_area");
			for (var i = 0; i < list.children.length;i++){
				if (list.children[i].getAttribute("noteid") == crt.getAttribute("drawnoteid")){
					list.children[i].setAttribute("highlight","1");
					break;
				}
			}

		}
		else if(crt.getAttribute("class") == "hl_drawnote" && do_highlight === 0)
		{
			crt.setAttribute("class","drawnote");
			var list = document.getElementById("list_area");
			list=list.children[0];
			for (var i=0;i<list.children.length;i++){
				if (list.children[i].getAttribute("noteid") == crt.getAttribute("drawnoteid"))
				{
					// Un-highlight the node
					list.children[i].removeAttribute("class");
					
					// Since we un-highlighed the node, we want to return to default state and since
					// we are using id for the purpose of special state, lets remove it
					list.children[i].removeAttribute("id");
					
					// By removing this special id, we restore the item css attributes
					graph_item = document.getElementById("draw_pointer");
					if (graph_item != null) {
						graph_item.removeAttribute("id");
					}
					break;
				}
			}
			list = document.getElementById("raw_area");
			for (var i = 0; i < list.children.length;i++){
				if (list.children[i].getAttribute("noteid") == crt.getAttribute("drawnoteid")){
					list.children[i].setAttribute("highlight","0");
				}
			}
		}
		crt = document.getElementById("list_pointer");
	//}
	//else alert("None note selected");
}



function parseDT(str) {
	// NOTE: Since we can have months like 08 or 09
	// javascript will parse think these as octals 
	// and will return 0. We need to define base 10 explicity
	// to make sure to prevent this behavior.
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

function newDT(str) {
	str = parseDT(str);
	var DT = new Date();
	DT.setTime(0-DT.getTime());
	DT.setTime(str);
	return DT;
}
