var width = 960,
	height = 600,
	colors = ['#7FDBFF', '#FFDC00', '#01FF70', '#DDDDDD'];

var svg = d3.select('body')
			.append('svg')
			.attr('width',width)
			.attr('height',height);


var countNodeId = new Array(200);
for (var i = countNodeId.length; i >= 0; -- i) countNodeId[i] = 0;
countNodeId[0]++;
countNodeId[1]++;
countNodeId[2]++;

var nodes = [ 	{id : 0, x : 83, y : 283, neighbors : new Array(), color: ''},
				{id : 1, x : 140, y : 257, neighbors : new Array(), color: ''},
				{id : 2, x : 100, y : 150, neighbors : new Array(), color: ''}],
	
	links = [	{source : nodes[0], target : nodes[1] },
				{source : nodes[1], target : nodes[2] }],
	lastNodeId = 3;
nodes[0].neighbors.push(nodes[1]);
nodes[1].neighbors.push(nodes[0]);
nodes[1].neighbors.push(nodes[2]);
nodes[2].neighbors.push(nodes[1]);


var drag_line = svg.append('svg:path')
	.attr('class', 'link dragline hidden')
	.attr('d', 'M0,0L0,0');

var path; 
var circle; 

var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;
 
function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}


function restart()
{
	// redraw everything
	svg.selectAll('g').remove();
	
	path =  svg.append('svg:g').selectAll('path'),
	circle = svg.append('svg:g').selectAll('g');
	
	circle = circle.data(nodes, function(d) { return d.id; });
	circle.selectAll('circle')
		.style('fill', function(d) { return d.color; });
	
	colorGraph();

	var g = circle.enter().append('svg:g');
	g.append('svg:circle')
		.attr('class','node')
		.attr('id', function (d) { return 'c'+ d.id })
		.attr('r',12)
		.attr('cx', function (d) { return d.x; })
		.attr('cy', function (d) { return d.y; })
		.style('fill', function(d) { return d.color; })
		.style('stroke', function(d) { return (d === selected_node) ? 'blue' : 'black'; })
		.on('mousedown', function(d) {
			if (d3.event.ctrlKey) return;
			
			mousedown_node = d;
			if (mousedown_node === selected_node) selected_node = null;
			else selected_node = mousedown_node;
			
			selected_link = null;
 
			  // reposition drag line
			drag_line
				/*
				.style('marker-end', 'url(#end-arrow)')
				*/
				.classed('hidden', false)
				.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);
		 	
			restart();
		})
		.on('mouseup', function(d) {
			if (!mousedown_node) return;
			
			drag_line
        .classed('hidden', true)
		/*
        .style('marker-end', '');
		*/
 
		  // check for drag-to-self
		  mouseup_node = d;
		  if(mouseup_node === mousedown_node) { resetMouseVars(); return; }
	 
		  // add link to graph (update if exists)
		  // NB: links are strictly source < target; arrows separately specified by booleans
		  var source, target, direction;
		  if(mousedown_node.id < mouseup_node.id) {
			source = mousedown_node;
			target = mouseup_node;
			//direction = 'right';
		  } else {
			source = mouseup_node;
			target = mousedown_node;
			//direction = 'left';
		  }
	 
		  var link;
		  link = links.filter(function(l) {
			return (l.source === source && l.target === target);
		  })[0];
	 	
		  if(link) {
			//link[direction] = true;
		  } else {
		  	
		  	source.neighborCount++;
			target.neighborCount++;
			source.neighbors.push(target);
			target.neighbors.push(source);
			link = {source: source, target: target};
			//link[direction] = true;
			links.push(link);
 		  }

		  // select new link
		  selected_link = link;
		  selected_node = null;

		  restart();
		});


	g.append('svg:text')
		.attr('x', function(d) { return d.x; })
		.attr('y', function(d) { return d.y; })
		//.attr('y', function (d) { return 4; })
		.attr('class','neighborCount')
		.text(function(d) { 
			/*
			nodes.forEach(function(d){
				var neighborCount = 0;
				links.forEach(function(j){
					if(j.source == d || j.target == d)
					{
						neighborCount++;
					}
				});
				d.neighborCount = neighborCount;
			});
			*/
			return d.neighbors.length; 
			/*
			return d.neighborCount; 
			old way of doing this 
			
			*/
		});
	
	
	
	//circle.exit().remove();
	
	// drawing paths
	
	path = path.data(links);
	
	path.classed('selected', function(d) { return d === selected_link; });
	
	path.enter().append('svg:path')
		.attr('class','link')
		.classed('selected',function(d) {return d === selected_link; })
		.attr('d', function (d)
		{
			var deltaX = d.target.x - d.source.x,
			deltaY = d.target.y - d.source.y,
			dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
			normX = deltaX / dist,
			normY = deltaY / dist,
			/*
			sourcePadding = d.left ? 17 : 12,
			targetPadding = d.right ? 17 : 12,
			*/
			sourcePadding = 12;
			targetPadding = 12;
			sourceX = d.source.x + (sourcePadding * normX),
			sourceY = d.source.y + (sourcePadding * normY),
			targetX = d.target.x - (targetPadding * normX),
			targetY = d.target.y - (targetPadding * normY);
			return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
		})
		.on('mousedown', function(d) {
			if(d3.event.ctrlKey) return;
		 
			// select link
			mousedown_link = d;
			if(mousedown_link === selected_link) selected_link = null;
			else selected_link = mousedown_link;
			selected_node = null;
			restart();
		});
		
		
}

function colorGraph() {
	nodes.sort(function(a, b){
	    return b.neighborCount - a.neighborCount;
	});
	nodes.forEach(function(d){
		d.color ='';
	});
	var counter = 0;
	for(let c of colors) {
		for(let n of nodes) {
			if(n.color == '') {
				neighborsHaveColor = false;
  				for(let adj of n.neighbors) {
  					if(c == adj.color) {
						neighborsHaveColor = true;
						break;
  					}
  					counter++;

  				}
			if(!neighborsHaveColor)
				n.color = c;
			}
  		}
	}
	console.log("Counter: " + counter + " Nodes: " + nodes.length);


}

function mousedown() {
  svg.classed('active', true);
 
  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;
 
  // insert new node at point
  var point = d3.mouse(this),
      node = {id: lastNodeId};
	  
	// find new last node ID
  countNodeId[lastNodeId]++;
  for (var i = 0; i < 200; i++)
	if (countNodeId[i] === 0) 
	{
	   lastNodeId = i;
	   break;
	}
  node.x = point[0];
  node.y = point[1];
  node.neighbors = new Array();
  node.color = '';
  nodes.push(node);
 
  restart();
}

function mousemove() {
  if(!mousedown_node) return;
 
  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
 
  restart();
}
 
function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      //.style('marker-end', '');
  }
 
  // because :active only works in WebKit?
  svg.classed('active', false);
 
  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}
var lastKeyDown = -1;


var drag = d3.behavior.drag()
	.on("drag", function (d)
	{
		console.log("dragging");
	
		var dragTarget = d3.select(this).select('circle');
		
		//console.log(this);
		
		var new_cx, new_cy;
		
		//console.log(d);
		
			dragTarget
		.attr("cx", function()
		{
			new_cx = d3.event.dx + parseInt(dragTarget.attr("cx"));
			return new_cx;
		})
		.attr("cy", function()
		{
			new_cy = d3.event.dy + parseInt(dragTarget.attr("cy"));
			return new_cy;
		});
		
		d.x = new_cx;
		d.y = new_cy;
		
		restart();
	});


function keydown() {
  d3.event.preventDefault();
 
  //if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;
 
  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(drag);
    svg.classed('ctrl', true);
  }
 
  if(!selected_node && !selected_link) return;
  
  /*
  switch(d3.event.keyCode) {
    //case 8: // backspace
    case 46: // delete
      if(selected_node) 
	  {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
		countNodeId[selected_node.id] = 0;
		for (var i = 0; i < 200; i++)
			if (countNodeId[i] === 0) 
			{
			   lastNodeId = i;
			   break;
			}
      } else if(selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      restart();
      break;
	/*  
    case 66: // B
      if(selected_link) {
        // set link direction to both left and right
        selected_link.left = true;
        selected_link.right = true;
      }
      restart();
      break;
    case 76: // L
      if(selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 82: // R
      if(selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if(selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
      break;
	 */
  }
 
function keyup() {
  lastKeyDown = -1;
 
  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}
svg.on('mousedown', mousedown)
	.on('mousemove', mousemove)
	.on('mouseup', mouseup);
d3.select(window)
	.on('keydown',keydown)
	.on('keyup',keyup);
restart();