//GLOBAL
function apply_screen_mask(){
	var root_body = document.getElementsByTagName("body");
	var root_mask = document.createElement("div");
	root_mask.setAttribute("id","screenmask");
	root_body[0].appendChild(root_mask);
	var mask_background = document.createElement("div");
	mask_background.setAttribute("id","screenmask_background")
	root_mask.appendChild(mask_background);
	var mask_content = document.createElement("div");
	mask_content.setAttribute("id","screenmask_content");
	root_mask.appendChild(mask_content);
	return mask_content;
}

function remove_screen_mask(){
	var root_mask = document.getElementById("screenmask");
	if(root_mask != null) root_mask.parentNode.removeChild(root_mask);
}

function loading_screen_mask(){
	var mask_content = apply_screen_mask();
	mask_content.style.width = "250px";
	mask_content.style.height = "185px";
	mask_content.style.marginLeft = "-125px";
	mask_content.style.marginTop = "-92px";
	mask_content.style.backgroundImage="url('../img/loading86.gif')";
}