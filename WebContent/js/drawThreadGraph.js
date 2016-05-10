var threadGraph = function(slider, width, height) {
  var that = this;
  console.log("width",width);
  if (slider) {
    slider.slider({
      range: true,
      min: 0,
      max: 500,
      values: [ 75, 300 ],
      slide: function( event, ui ) {
        that.updateZoomExtents([ui.values[ 0 ], ui.values[ 1 ]]);
      }
    });
  }
  
  function timeFormat(formats) {
    return function(date) {
      var i = formats.length - 1, f = formats[i];
      while (!f[1](date)) f = formats[--i];
      return f[0](date);
    };
  }
  
  /// Custom time scale format
  var customTimeFormat = timeFormat(
      [
         [d3.time.format("%Y"), function() { return true; }],
         [d3.time.format("%b %Y"), function(d) { return d.getMonth(); }],
         [d3.time.format("%b %d %Y"), function(d) { return d.getDate() != 1; }],
//         [d3.time.format("%a %d"), function(d) { return d.getDay() && d.getDate() != 1; }]
      ]);

  
  /// View parameters
  var margin = {top: 10, right: 0, bottom: 30, left: 0, offset:50},
      margin2 = {top: 0, right: 0, bottom: 20, left: 0},
      totalWidth = width || 930,
      totalHeight = height || 390, 
      topViewHeight = totalHeight - 60,
      width = totalWidth - margin.left - margin.right,
      topSceneHeight = totalHeight - margin.top - margin.bottom,
      topSceneBottom = topViewHeight - margin.bottom,
      bottomSceneBottom = totalHeight - topViewHeight - margin2.bottom,
      bottomSceneHeight = totalHeight - topViewHeight - margin2.bottom - margin2.top;
  
  /// Some other necessary parameters
  var xOffset = 50;
  
  /// X, Y scale
  var xCurr = d3.time.scale().range([0 + xOffset, width - xOffset]),
      xBase = d3.time.scale().range([0 + xOffset, width - xOffset]),
      yCurr = d3.scale.linear().range([topSceneBottom - margin.offset, margin.top]),
      yBase = d3.scale.linear().range([topSceneBottom - margin.offset, margin.top]),
      yFocus = d3.scale.linear().range([topSceneBottom - margin.offset, margin.top]),
      yBrush = d3.scale.linear().range([bottomSceneBottom, margin2.top]);
 
  var yBar = d3.scale.linear()
      .range([bottomSceneHeight, margin2.top]);
  
  var xAxis = d3.svg.axis().scale(xCurr).orient("bottom"),
      xAxis2 = d3.svg.axis().scale(xBase).orient("bottom").tickSubdivide(true);
  
  xAxis2.tickFormat(customTimeFormat);
  xAxis2.tickPadding(5);
  
  var zoom = d3.behavior.zoom()
    .on("zoom", draw);
    
  var brusho = null;
  var node1 = null;
  var countByDate = {};
  var dateByIndex = {};
  var valueByIndex = {};  
  var index = 0;
  var forcedSim = 0;
  
  /// Label anchor and its links
  var nodes = [];
  
  /// Labels for authors
  var labelAnchors = [];
  var labelAnchorLinks = [];
  
  /// Labels for titles
  var titleAnchorLinks = [];
  
  /// Force layout
  var link;
  var force = d3.layout.force()
                .size([width, topSceneHeight]);
  
  /// Other variables
  var force2, anchorNode, svg = null, 
    focus = null, halfSqDim = 5;
  
  var linkedByIndex = {};
  
  this.readData = function(data, divId) {
    // First user interface extents
    var tmin = d3.min(data.nodes, function(d) { return d.time; });
    var tmax = d3.max(data.nodes, function(d) { return d.time; });
    
    console.log(tmin, tmax);
    
    if (tmin === tmax) {
      tmax = 1.001 * tmin;
    }
    
    updateIntefaceExtents([tmin, tmax], true);
    
    if (divId === undefined || divId === null) {
      divId = '#thread_vis';
    }
    
    svg = d3.select(divId).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", topSceneHeight + margin.top + margin.bottom);
  
    marker = svg.append("svg:defs").selectAll("marker")
      .data(["buildons", "references"])
    .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");  
  
    // FIXME Fix clippath (For some reason drawing two graphs causing 
    // clippath to clip other graph)
//    var path = svg.append("defs").append("clipPath").attr("id", "clip");
//    path.append("rect")
//    .attr("width", width)
//    .attr("height", topSceneHeight)
//    .attr("fill", "blue");
    
    focus = svg.append("g")
//      .attr("clip-path",  "url(#clip)")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var context = svg.append("g")
      .attr("transform", "translate(" + margin2.left + "," + topViewHeight + ")");
    
    focus.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("class", "pane")
      .call(zoom);
    
    context.append("rect").attr("width", "100%").attr("height", "100%").attr("fill", "#F1FAC9");
    
    force
      .nodes(data.nodes)
      .links(data.links)
      .start();
  
    data.nodes.forEach(function(d) {
      d.date = d.time;
      var dateObj = new Date(d.date);
      var newDate = dateObj.getUTCFullYear() + "/" + dateObj.getUTCMonth() +
        + "/" + dateObj.getUTCDate();
      d.value = 0;
      d.ran = Math.random() * 0.8;
  
      if (countByDate.hasOwnProperty(newDate)) {
        countByDate[newDate] += 1;
        d.value = countByDate[newDate];
      } else {
        countByDate[newDate] = 1;
        d.value = countByDate[newDate];
      }
  
      dateByIndex[index] = d.date;
  
      /// Fill in data for author lables
      labelAnchors.push({
        node : d,
        label : d.author,
        value : d.value,
        ran: d.ran,
        date: d.date
      });
      labelAnchors.push({
        node : d,
        label : d.author,
        value : d.value,
        ran: d.ran,
        date: d.date
      });
      labelAnchors.push({
        node : d,
        label : d.id,
        value : d.value,
        ran: d.ran,
        date: d.date
      });
      
      labelAnchorLinks.push({
        source : (index) * 3,
        target : (index * 3 + 1),
        weight : 1
      });
      
      labelAnchorLinks.push({
        source : (index) * 3,
        target : (index * 3 + 2),
        weight : 1
      });
  
      index += 1;
    });
    
    /// Fill up value by index
    index = 0;
    data.nodes.forEach(function(d) {
      valueByIndex[index++] = d.ran;
    });
  
    data.links.forEach(function(d) {
      linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
  
    /// Define domains for scales
    var domain = d3.extent(data.nodes.map(function(d) { return d.date; }));
    
    // Current min and max range
    var format = d3.time.format("%m-%d-%Y");
    min_range = format(new Date(domain[0]));
    max_range = format(new Date(domain[1]));
    
    if (domain[0] === domain[1]) {
      domain[1] = 1.001 * domain[0];
    }
    
    console.log(min_range);
    console.log(max_range);
    
    xCurr.domain(domain);
    xCurr.nice();
    
    var tickVals = [];
    var dm = xCurr.domain();
    dm[0] = dm[0].getTime();
    dm[1] = dm[1].getTime();
    tickVals.push(new Date(dm[0]));
    var delta = (dm[1] - dm[0]) / 10.0;
    for (var kk = 1; kk < 10; ++kk) {
      tickVals.push(new Date(dm[0] + delta * kk));
    }
    tickVals.push(new Date(dm[1]));
    xAxis2.tickValues(tickVals);
    
    yBase.domain([0, 0.9]);
    yCurr.domain(yBase.domain());
    yFocus.domain([0, 0.9]);
    yBrush.domain([0, 0.9]);
    
    xBase.domain(xCurr.domain());
    yBar.domain([0, d3.max(data.nodes, function(d) { return d.value; })]);
  
    force2 = d3.layout.force()
               .nodes(labelAnchors)
               .links(labelAnchorLinks)
               .gravity(0)
               .linkDistance(12)
               .linkStrength(8)
               .charge(-100)
               .size([width, topSceneHeight]);
    force2.start();
    
    anchorLink = focus.selectAll("line.anchorLink")
      .data(labelAnchorLinks);
  
    /// Create label nodes
    anchorNode = focus.selectAll("g.anchorNode")
      .data(force2.nodes())
      .enter()
      .append("svg:g")
      .attr("class", "anchorNode");
  
    anchorNode.append("svg:circle")
      .attr("r", 4);
  
    anchorNode.append("svg:text")
      .attr("class", function(d, i) {
        return i % 3 === 1 ? "anchorText" : "titleText";
        })
      .attr("text-anchor", "start")
      .text(function(d, i) {
        return i % 3 == 0 ? "" : d.label;
      });
  
    /// Create title label nodes
    titleLink = focus.selectAll("line.titleLink")
      .data(titleAnchorLinks);
  
    /// Create links
    link = focus.selectAll("path.links")
      .data(data.links)
      .enter().append("svg:path")
        .attr("class", function(d) { return "links link-" + d.type; })
        .style("stroke-width", function(d) { return 1.2; })
        .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
  
    link.attr("d", function(d) {
      var sourceX =  xCurr(dateByIndex[d.source.index]);
      var sourceY = yBase(valueByIndex[d.source.index]); 
      var targetX = xCurr(dateByIndex[d.target.index]);
      var targetY = yBase(valueByIndex[d.target.index]);
  
      var dx = targetX - sourceX,
        dy = targetY - sourceY,
        dr = Math.sqrt(dx * dx + dy * dy)*5;
      return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
    });
  
    node1 = focus.selectAll("rect.mnode")
            .data(data.nodes)
              .enter().append("svg:rect")
                .attr("noteid", function(d) { return d.noteid; })
                .attr("class","mnode")
                .attr("width", 2 * halfSqDim)
                .attr("height", 2 * halfSqDim)
                .attr("x", function(d){ return (xCurr(d.date) - halfSqDim); })
                .attr("y", function(d){ return (yBase(d.ran) - halfSqDim); })
                .on("mouseover", fade(0)).on("mouseout", undoFade())
                .on('click', handleNodeClick);
  
    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + topSceneBottom + ")")
      .call(xAxis);

    // Add tooltips
    node1.each(function(d) {
      var format = d3.time.format("%Y-%m-%d %X");
      var contentText = "<b>Title    :  " + d.id + "</b><br><br>"+ "<b>By :   "+d.author+"  "
        +" At : "+ format(new Date(d.time));
      //if (typeof d.content !== "undefined") {
        contentText += "</b><br><br>"  + "<b>Content: </b>  " + d.content;
      //}
      
      $(this).qtip({
        content: {
          text: contentText },
        hide: {
          fixed: true,
          delay: 300
        }
      });
    });
  
    /// Create context nodes
    node2 = context.selectAll("circle.dot2")
            .data(data.nodes)
            .enter().append("rect")
             .attr("class","bar")
             .attr("x", function(d){ return xBase(d.date); })
             .attr("width", 4)
             .attr("y", function(d) { return yBar(d.value); })
             .attr("height", function(d) { return bottomSceneBottom - yBar(d.value); });
  
    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bottomSceneBottom + ")")
      .call(xAxis2);
    
    context.append("g")
      .attr("class", "brush")
      .call(d3.svg.brush().x(xBase).y(yBrush)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend));
    
    zoom.x(xCurr).scaleExtent([1, 10]);
  };
  
  function brushstart() {
    svg.classed("selecting", true);
  }
  
  function brushend() {
    svg.classed("selecting", !d3.event.target.empty());
  }
  
  function brushmove() {
    var e = d3.event.target.extent();
    node1.classed("selected", function(d) {
      return (e[0][0] <= d.date && d.date <= e[1][0]);
    });
    node1.classed("mnode", function(d) {
        return (e[0][0] > d.date || d.date > e[1][0]);
    });
  
    brush();
  }
  
  function listProperties(obj) {
     var propList = "";
     for(var propName in obj) {
        if(typeof(obj[propName]) != "undefined") {
           propList += (propName + ", ");
        }
     }
  }
  
  function brush() {
    brusho = d3.event.target;
  
    // Set the domain of x and y (scale domain)
    xCurr.domain(brusho.empty() ? xBase.domain() : [brusho.extent()[0][0], brusho.extent()[1][0]]);
    xCurr.nice();
    yCurr.domain(brusho.empty() ? yBase.domain() : [brusho.extent()[0][1], brusho.extent()[1][1]]);
    yFocus.domain(brusho.empty() ? yBase.domain() : [brusho.extent()[0][1], brusho.extent()[1][1]]);
   
    recomputePositions();
  
    // Start the simulation again because it will trigger the tick event which
    // will re-evaluate the label positions
    forcedSim = 1;
    force.start();
  }
  
  var updateLink = function() {
    this.attr("x1", function(d) {
      return d.source.x;
    }).attr("y1", function(d) {
      return d.source.y;
    }).attr("x2", function(d) {
      return d.target.x;
    }).attr("y2", function(d) {
      return d.target.y;
    });
  };
  
  var updateNode = function() {
    this.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  };
  
  /// On tick event start the simulation for anchor nodes
  force.on("tick", function() {
    force2.start();
    anchorNode.each(function(d, i) {
      if (this.childNodes === undefined || this.childNodes === null ||
          this.childNodes === "") {
        console.log('child nodes are undefined');
        return;
      }
      
      /// forcedSim is ON when we brush context view 
      if(i % 3 === 0) {
        d.x = xCurr(d.node.date);
        if (forcedSim === 1) {
          d.y = yFocus(d.node.ran);
        } else {
          d.y = yBase(d.node.ran);
        }
  
      } else {
        var b = this.childNodes[1].getBBox();
        
        var delX, delY;
        
        /// forcedSim is ON when we brush context view
        if (forcedSim === 1) {
          delY = yFocus(d.node.ran);
        } else {
          delY = yBase(d.node.ran);       
        }
        
        delX= xCurr(d.node.date);
        
        var diffX = d.x - delX;
        var diffY = d.y - delY;
  
        var dist = Math.sqrt(diffX * diffX + diffY * diffY);
  
        var shiftX = b.width * (diffX - dist) / (dist * 2);
        shiftX = Math.max(-b.width, Math.min(0, shiftX));
        var shiftY = 5; 
        
        /// Update both the circle and the text
        //this.childNodes[0].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
        this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
      }
    });
  
    anchorNode.call(updateNode);
    anchorLink.call(updateLink);
  });
  
  function draw() {
    if (brusho != null) {
      focus.select(".brush").call(brusho.clear());
    }
    updateIntefaceExtents(xCurr.domain());
    recomputePositions();
    forcedSim = 1;
    force.start();
  }
  
  function recomputeLinksPositions(selector) {
    focus.selectAll(selector).attr("d", function(d) {
      var sourceX =  xCurr(dateByIndex[d.source.index]), 
      sourceY = yFocus(valueByIndex[d.source.index]), 
      targetX = xCurr(dateByIndex[d.target.index]),
      targetY = yFocus(valueByIndex[d.target.index]);
  
      var dx = targetX - sourceX,
          dy = targetY - sourceY,
          dr = Math.sqrt(dx * dx + dy * dy);
          if (d.type === 'buildons') {
            //console.log('buildons ', d);
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
          } else {
            //console.log('references ', d);
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,0 " + targetX + "," + targetY;
          }
    });
  }
  
  function recomputePositions() {
    recomputeLinksPositions("path.link-buildons");
    recomputeLinksPositions("path.link-references");  
  
    // Re-evaluate the center of nodes in this new domain
    focus.selectAll("rect.mnode").attr("x", function(d) { return (xCurr(d.date) - halfSqDim); });
    focus.selectAll("rect.mnode").attr("y", function(d) { return (yFocus(d.ran) - halfSqDim); });
  
    focus.selectAll("rect.selected").attr("x", function(d) { return (xCurr(d.date) - halfSqDim); });
    focus.selectAll("rect.selected").attr("y", function(d) { return (yFocus(d.ran) - halfSqDim); });
  
    // Kind of same of the tick labels
    focus.select(".x.axis").call(xAxis);
  }
  
  /** 
   * Toggle display of author labels
   * 
   * @param elem
   */
  this.toggleAuthors = function(elem) {
    // Need to do more but for now just toggle
    var anchorTexts = focus.selectAll(".anchorText");
    var currentState = anchorTexts.style("display");
    if (currentState !== "none") {
      anchorTexts.style("display", "none");
      if (elem === null || elem === undefined) {
        return;
      }
      
      elem.innerHTML = 'Show Author';
    }
    else {
      anchorTexts.style("display", "");
      if (elem === null || elem === undefined) {
        return;
      }
      elem.innerHTML = 'Hide Author';
    }
    
    this.draw();
  };
  
  /** 
   * Toggle display of titles
   * 
   * @param elem
   */
  this.toggleTitles = function(elem) {
    // Need to do more but for now just toggle
    var titleTexts = focus.selectAll(".titleText");
    var currentState = titleTexts.style("display");
    if (currentState !== "none") {
      titleTexts.style("display", "none");
      if (elem === null || elem === undefined) {
        return;
      }
      
      elem.innerHTML = 'Show Title';
    }
    else {
      titleTexts.style("display", "");
      if (elem === null || elem === undefined) {
        return;
      }
      elem.innerHTML = 'Hide Title';
    }  
    this.draw();
  };
  
  
  /** 
   * Toggle display of highlighted notes
   * 
   * @param elem
   */
  this.toggleHighlightedNotes = function(elem) {
    if($(elem).html() === "Show Highlighted Notes")
    {
      this.showHighlighted();
      $(elem).html ("Show All Notes");
    }
    else
    {
      this.showAllNotes();
      $(elem).html("Show Highlighted Notes");
    }
  };
  
  /** 
   * Toggle display of highlighted-buildons between notes
   * 
   * @param elem
   */
  this.toggleHighlightedBuildons = function(elem) {
    
    if($(elem).html() === "Show Highlighted Buildons")
    {
      //check if show all notes is turned on
      var sh = document.getElementById("showallhighlighted");
      if( sh.innerHTML === "Show All Notes")
      {
       this.toggleHighlightedNotes('#showallhighlighted');
      }
      
      this.showHighlightedBuildons();
      $(elem).html ("Hide Highlighted Buildons");
    }
    else
    {
      this.hideHighlightedBuildons();
      $(elem).html("Show Highlighted Buildons");
    }
  };
  
  /** 
   * Show highlighted buildons
   */
  this.showHighlightedBuildons = function()
  {
    // Enable show links first
    d3.selectAll("path.link-buildons").style('display', "");
    
    // Hide all the nodes
    d3.selectAll('rect.mnode').each(function(n) {
      this.setAttribute('opacity', 0);
      this.setAttribute("pointer-events", "none");
      var api = $(this).qtip('api');
      //api.disable(true);
    });
    
    // Turn on all highlighted nodes
    d3.selectAll('rect.mnode.highlighted').each(function(n) {
      this.setAttribute('opacity', 1);
      this.setAttribute("pointer-events", "auto");
      var api = $(this).qtip('api');
      //api.enable(true);
    });
    
   //Title and author turn off
    d3.selectAll('rect.mnode').each(function(d) {
      d3.selectAll('.anchorText').each(function(a){
        //console.log('this two ', this);
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 0);
        }
      });
    });
    
    d3.selectAll('rect.mnode').each(function(d) {
      d3.selectAll('.titleText').each(function(a){
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 0);
        }
      });
    });
    
    //Now turn on only desired title and authors
    
    // Now turn links  ON or OFF one by one between only highlighted and highlighted+unhighlighted 
    d3.selectAll("path.link-buildons").each(function(d) {
    if(d.source.highlight_state === "1" || d.target.highlight_state === "1") {
      this.setAttribute('opacity', 1);
      d3.selectAll('rect.mnode').each(function(n) {
        // Now check if n.noteid === d.source.noteid || n.noteid === d.target.noteid)
        if(n.noteid === d.source.noteid || n.noteid === d.target.noteid) {
          // If it is set its opacity to 1
          this.setAttribute('opacity', 1);
          this.setAttribute("pointer-events", "auto");
          var api = $(this).qtip('api');
          //api.enable(true);
          
          d3.selectAll('.anchorText').each(function(a){
            //console.log('this two ', this);
            if (that.areNodeAndLabel(n, a.node)) {
              this.setAttribute('opacity', 1);
            }
          });
          
          d3.selectAll('.titleText').each(function(a){
            if (that.areNodeAndLabel(n, a.node)) {
              this.setAttribute('opacity', 1);
            }
          });
          
         }
        });
    } 
    else {
      this.setAttribute('opacity', 0);
    }
   });
       
    d3.selectAll('rect.mnode.highlighted').each(function(d) {
      d3.selectAll('.anchorText').each(function(a){
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 1);
        }
      });
    });
        
    d3.selectAll('rect.mnode.highlighted').each(function(d) {
      d3.selectAll('.titleText').each(function(a){
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 1);
        }
      });
    });
    
  };
  
  /**
   * Hide highlighted buildons
   */
  this.hideHighlightedBuildons = function()
  {
    // Disable show links first
    d3.selectAll("path.link-buildons").style('display', 'none');
    
    // Now turn each of them OFF
    d3.selectAll("path.link-buildons").each(function(d) {
      this.setAttribute('opacity', 0);
    });
    
    // Show all the nodes
    d3.selectAll('rect.mnode').each(function(n) {
      this.setAttribute('opacity', 1);
      this.setAttribute("pointer-events", "auto");
      var api = $(this).qtip('api');
      //api.enable(true);
    });
    
    //Default author and text
    d3.selectAll('.anchorText').each(function(a){
      this.setAttribute('opacity', 1);
    });
    
    d3.selectAll('.titleText').each(function(a){
      this.setAttribute('opacity', 1);
    });  
    
  };
  
  /**
   * Check if a node is connected to its label
   */
   this.areNodeAndLabel = function(a, b) {
     if (a.noteid === b.noteid) {
       return true;
     }
    
     return false;
  };
  
  this.showHighlighted = function() {
    var that = this;
    //console.log('this one ', this);
    
  //check if show show highlighted buildon is turned on
    var sh = document.getElementById("showallhighlightedbuildons");
    if( sh.innerHTML === "Hide Highlighted Buildons")
    {
     this.toggleHighlightedBuildons('#showallhighlightedbuildons');
    }
    
    //d3.selectAll('rect.mnode').classed('mnodeHide', true);
    // Hide all the nodes
    d3.selectAll('rect.mnode').each(function(n) {
      this.setAttribute('opacity', 0);
      var api = $(this).qtip('api');
      //api.disable(true);
    });
    
    //Show only highlighted notes
    //d3.selectAll('rect.mnode.highlighted').classed('mnodeHide', false); 
    d3.selectAll('rect.mnode.highlighted').each(function(n) {
      this.setAttribute('opacity', 1);
      var api = $(this).qtip('api');
      //api.enable(true);
    });
    
    d3.selectAll('rect.mnode').each(function(d) {
      d3.selectAll('.anchorText').each(function(a){
        //console.log('this two ', this);
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 0);
        }
      });
    });
    
    d3.selectAll('rect.mnode.highlighted').each(function(d) {
      d3.selectAll('.anchorText').each(function(a){
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 1);
        }
      });
    });
    
    d3.selectAll('rect.mnode').each(function(d) {
      d3.selectAll('.titleText').each(function(a){
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 0);
        }
      });
    });
    
    d3.selectAll('rect.mnode.highlighted').each(function(d) {
      d3.selectAll('.titleText').each(function(a){
        if (that.areNodeAndLabel(d, a.node)) {
          this.setAttribute('opacity', 1);
        }
      });
    });
    
    d3.selectAll("path.link-buildons").each(function(d) {
      //alert(d.source.highlight_state);
      //alert(d.target.highlight_state);
    if(d.source.highlight_state === "0" || d.target.highlight_state === "0") {
      this.setAttribute('opacity', 0);
    }
   });
    
    d3.selectAll("path.link-references").each(function(d) {
      //alert(d.source.highlight_state);
      //alert(d.target.highlight_state);
    if(d.source.highlight_state === "0" || d.target.highlight_state === "0") {
      this.setAttribute('opacity', 0);
    }
   });
  };
  
  this.showAllNotes = function() {
    
    //turn on all the notes
    d3.selectAll('rect.mnode').each(function(n) {
      this.setAttribute('opacity', 1);
      //turn on all the q-tips
      var api = $(this).qtip('api');
      //api.enable(true);
    });
    //d3.selectAll('rect.mnodeHide').classed('mnode', true);
    
    //d3.selectAll('rect.mnode').classed('mnodeHide', false);
    
    d3.selectAll('.anchorText').each(function(a){
      this.setAttribute('opacity', 1);
    });
    
    d3.selectAll('.titleText').each(function(a){
      this.setAttribute('opacity', 1);
    });  
    
    d3.selectAll("path.link-buildons").each(function(d) {
      this.setAttribute('opacity', 1);
    });
    
    d3.selectAll("path.link-references").each(function(d) {
      this.setAttribute('opacity', 1);
    });
    
  };
  
  /* *
   * Highlight notes
   */
  this.toggleHighlightNodes = function() {
    return;
  };
  
  /** 
   * 
   * @param event
   */
  this.toggleSelectNode = function(item) {
    if (item === null) {
      return;
    }
    
    var selectedNodes = focus.selectAll(".mnode").filter(function(d, i) { return (d.noteid === item.getAttribute("noteid")); });
    if ( selectedNodes !== null && selectedNodes.length === 1 && selectedNodes !== "") {
      if ((selectedNodes).classed("selected")) {
        (selectedNodes).classed("selected", false); 
      }
      else {
        focus.selectAll(".selected").classed("selected", false);
        (selectedNodes).classed("selected", true);
      }
    }
  };
  
  /** 
   * 
   * @param event
   */
  this.toggleHighlightNode = function(item) {
    if (item === null) {
      return;
    }
    
   return this.toggleHiglightNodeById(item.getAttribute("noteid"));
  };
  
  /**
   * Toggle highlight notes using noteid
   */
  this.toggleHiglightNodeById = function(noteId) {
    var selectedNodes = focus.selectAll(".mnode").filter(function(d, i) { return (d.noteid === noteId); });
    if ( selectedNodes !== null && selectedNodes.length === 1 && selectedNodes !== "") {
      
      if ((selectedNodes).classed("highlighted")) {
        (selectedNodes).classed("highlighted", false);
      }
      else {
        //d3.selectAll(".highlighted").classed("highlighted", false);
        (selectedNodes).classed("highlighted", true); 
      }
    }
  };
  
  /** 
   * Toggle display of links
   *
   * @todo use type information
   * @param elem
   */
  this.toggleLinks = function(elem, type, noLinks) {
    console.log(noLinks);
    
    // Need to do more but for now just toggle
    var selector = null;
    if (type === null || type === undefined) {
      return;
    } else {
      selector = "path.link-" + type;
    }
     
    var links = d3.selectAll(selector);
    if (links === null || links.empty()) {
      if(elem)
      {
        if(noLinks)
        {
          $(noLinks).dialog();
        }
        return;
      }
      return;
    }
    
    
    var currentState = links.style("display");
    console.log('current state',currentState);
    if (currentState !== "none") {
      links.style("display", "none");
      
      links.each(function(d) {
        this.setAttribute('opacity', 0);
      });
      
      if (elem === null || elem === undefined) {
        return;
      }
      
      if (type === 'buildons') {
        $(elem).html('Show Build-on');
      } else {
        $(elem).html('Show Reference');
      }
    }
    else {
      links.each(function(d) {
        this.setAttribute('opacity', 1);
      });
      
      links.style("display", "");
      
      if (elem === null || elem === undefined) {
        return;
      }
      if (type === 'buildons') {
        $(elem).html('Hide Build-on');
      } else {
        $(elem).html('Hide Reference');
      }
    }
    
    this.draw();
  };
  
  /**
   * Check if nodes are connected to each other via some link
   */
  function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
  }
  
  /**
   * Undo fade
   */
  function undoFade() { 
    return function(d) { 
      d3.selectAll('.fadedlink').each(function(d) {
        d3.select(this).classed("fadedlink", false);
        this.setAttribute('opacity', 1);
      });
      
//      d3.selectAll('.fadednode').each(function(d) {
//        d3.select(this).classed("fadednode", false);
//        d3.select(this).classed("mnode", true);
//        this.setAttribute('opacity', 1);
//      });
      
      node1.style("stroke-opacity", function(o) {
        if (d3.select(this).classed("fadednode")) {
          this.setAttribute('opacity', 1);
          d3.select(this).classed("fadednode", false);
          this.removeAttribute('pointer-events');
          return 1;
        }});  
      
      d3.selectAll('.fadedanchor').each(function(d) {
        d3.select(this).classed("fadedanchor", false);
        this.setAttribute('opacity', 1);
      });
    };
  }
  
  /**
   * Fade 
   */
  function fade(opacity) {
    return function(d) {
        if (this.getAttribute("opacity") === "0") {
          return 1;
        }
        
        console.log('....pointer events ...', this.getAttribute("pointer-events"));
      
        node1.style("stroke-opacity", function(o) {  
          thisOpacity = isConnected(d, o) ? 1 : opacity;
          if (this.getAttribute('opacity') !== "0") {
            // If this is visible now then we need to restore it.
            // Also prevent setting opacity and other attributes on itself
            if (d !== o) {
              d3.select(this).classed("fadednode", true);
              this.setAttribute('opacity', thisOpacity);
              this.setAttribute('pointer-events', "none");
            }
          }
          return 1;
        });
  
        var currHighlightedBuildonsText = $("#showallhighlightedbuildons").text();
        currHighlightedBuildonsText = currHighlightedBuildonsText.replace(/^\s+|\s+$/g,'');
        
        var currHighlightedText = $("#showallhighlighted").find("a:first").text();
        currHighlightedText = currHighlightedText.replace(/^\s+|\s+$/g,'');
        
        if(currHighlightedBuildonsText === "Hide Highlighted Buildons" || (currHighlightedText === "Show All Notes")) {
          
          //do nothing, do not execute the below function
          link.each(function(o) {
            if ( (o.source === d || o.target === o) &&  this.getAttribute('opacity') !== "0") {
              this.setAttribute('opacity', 1);
            } else {
              if (this.getAttribute('opacity') !== "0") {
                this.setAttribute('opacity', 0);
                d3.select(this).classed("fadedlink", true);
              } 
            }
          });
        }
        else {
          link.each(function(o) {
            if (o.source === d || o.target === o) {
              this.setAttribute('opacity', 1);
            } else {
              this.setAttribute('opacity', opacity);
              d3.select(this).classed("fadedlink", true);
            }
          });
//          link.style("opacity", opacity).style("opacity", function(o) {
//              return o.source === d || o.target === d ? 1 : 0.6 * opacity;
//          });
        }
  
         anchorNode.each(function(o) {
          thisOpacity = isConnected(d, o.node) ? 1 : opacity;
          
          if (this.getAttribute('opacity') !== "0") {
            this.setAttribute('opacity', thisOpacity);
            d3.select(this).classed("fadedanchor", true);
          }
        });
    };
  }
  
  /** 
   * Handle node click
   */
  function handleNodeClick() {
    // @todo Need to figure out how we can save the previous 
    // fill color  
  //  node1.style('fill', '#B165D4');
  //  d3.select(this)
  //      .style("fill", "red");
    node1.classed("selected", false);
    d3.select(this).classed("selected", true);
    selectGraphItem(this.getAttribute("noteid"));
    highlightstate();
  }
  
  /** 
   * Update zoom extents
   */
  this.updateZoomExtents = function(extents) {
    //Set the domain of x and y (scale domain)
    xCurr.domain(extents);
    xCurr.nice();
    
    recomputePositions();
  
    // Start the simulation again because it will trigger the tick event which
    // will re-evaluate the label positions
    forcedSim = 1;
    force.start();
  };
  
  /** 
   * Reset graph to view entire time range
   */
  this.resetGraphView = function() {
    if (slider) {
      xCurr.domain([slider.slider("option", "min"), $("#slider").slider("option", "max")]);
      xCurr.nice();
      this.draw();
    }
  };
  
  /**
   * Draw method
   * 
   * @public 
   */
  this.draw = function() {
    draw();
  };
  
  /** 
   * Update ui
   */
  function updateIntefaceExtents(extents, updateRange) {
    if (slider) {
      if (updateRange) {
        slider.slider('option',{min: extents[0], max: extents[1]});
      }
      slider.slider({ values: [ extents[0], extents[1] ] });
    }
  }
};