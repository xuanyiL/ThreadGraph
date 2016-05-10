<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%@ page import="java.util.*,java.sql.*"%>
<%@ page import="Graph.*" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<link href="css/stickyhead.css" rel="stylesheet" type="text/css">
<link href="css/screenLock.css" rel="stylesheet" type="text/css">
<link href="css/itm_week_beta.css" rel="stylesheet" type="text/css">
<link href="css/btn_link.css" rel=StyleSheet type="text/css">
<link href="css/jquery-ui.css" rel="stylesheet" />
<link href="css/jquery.qtip.min.css" rel="stylesheet" type="text/css">
<link href="css/thread.css" rel="stylesheet" type="text/css">
<link href="css/impress.css" rel="stylesheet" type="text/css">
<link href="css/drawThreadGraph.css" rel="stylesheet" type="text/css">

<script src="js/jquery.js" type="text/javascript"></script>
<script src="js/jquery-ui.js" type="text/javascript"></script>
<script src="js/d3.v3.min.js" type="text/javascript"></script>
<script src="js/jquery.qtip.min.js" type="text/javascript"></script>
<script src="js/drawThreadGraph.js" type="text/javascript"></script>
<script src="js/itm_week_beta.js" type="text/javascript"></script>
<script src="js/screenLock.js" type="text/javascript"></script>
</head>
<%
	//传参
	String projectn = "kirk-human body";
	String threadName = "Bones";
	String database = "itm12";
	int totalnotes=0;
	//进行数据库查询操作 得到所有的noteid和addtime
	sqls s = new sqls();
	Operatedb opdb = new Operatedb(s, database);
	String nidts = "";

	ResultSet rs = opdb.getC().executeQuery(
			"SELECT note_id,addtime FROM  thread_note inner join  project2 on  project2.idProject =  thread_note.projectid where project2.projectname='"
					+ projectn + "'and thread_note.threadfocus = '" + threadName + "';");
	String getvalue = "@";
	while (rs.next()) {
		getvalue += rs.getString(1) + "@";
		nidts += rs.getString(1) + "=" + rs.getString(2) + ";";
		totalnotes++;
	}
/* 	System.out.println("***********1***********");
	System.out.println(getvalue);
	System.out.println(nidts);
	System.out.println("***********1***********"); */

	String[] strid = null;
	Operatedb opdb_author = new Operatedb(new sqls(), database);

	//---传参---
	String nidts_str = nidts;
	if (nidts_str != null) {
		nidts_str = nidts_str.replaceAll(" ", "&#32;");
	}

	//计算不同的authorid的数量
	sqls st = new sqls();
	Operatedb opdb_ct = new Operatedb(st, database);
	ResultSet project_id = opdb_ct.getC()
			.executeQuery("select idProject from project2 where projectname='" + projectn + "'");
	int pid = 0;
	if (project_id.next()) {
		pid = project_id.getInt(1);
	}

	if (project_id != null) {
		try {
			project_id.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	ResultSet tars = opdb_ct.getC().executeQuery(
			"select count(distinct authorid) from  thread_note inner join  publish_author_note on  thread_note.note_id =  publish_author_note.noteid and  thread_note.threadfocus='"
					+ threadName + "'and thread_note.projectid='" + pid + "';");
	String authorcnt = null;

	if (tars.next()) {
		authorcnt = tars.getString(1);
		//System.out.println("---------------------- "+authorcnt);
	}

	if (tars != null) {
		try {
			tars.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
/* 	System.out.println("***********2***********");
	System.out.println(pid);
	System.out.println(authorcnt);
	System.out.println("***********2***********"); */

	String thread_owner = null;
	int deleted = 0;
	//得到thread_owner
	sqls s0 = new sqls();
	Operatedb opdb0 = new Operatedb(s0, database);
	ResultSet rs0 = opdb0.getC().executeQuery("select author from project_thread where threadfocus='"
			+ threadName + "'and projectid=" + pid + ";");
	if (rs0.next()) {
		thread_owner = rs0.getString(1);
		//System.out.println("---------------------- "+thread_owner);
	}

	boolean isThreadDeleted = false;

	if (rs0 != null) {
		try {
			rs0.close();
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}

	if (opdb0 != null) {
		opdb0.CloseCon();
	}

	if (s0 != null) {
		s0.Close();
	}

/* 	System.out.println("***********3***********");
	System.out.println(thread_owner);
	System.out.println("***********3***********"); */
%>


<body class="impress-not-supported" onload="render()">


<%
//************************************显示***************************
//传参
	if ((getvalue != null) && !(getvalue.equals("null")) && !(getvalue.equals("@"))) {
		String[] strvalue = getvalue.split("&");
		strid = strvalue[0].split("@");
		String strcon = "( note_table.noteid = ";
		String threadNoteQueryStr = "thread_note.noteid =";

		int[] intid = new int[3000]; //this limits the number of id is 1000 at most!
		int ival;

		// Get the id of selected notes 
		for (int i = 1; i < strid.length; i++) { // Be careful, the index starts with "1" here!!
			intid[i] = Integer.valueOf(strid[i]).intValue(); //change the id value from string to int
			if (i < strid.length - 1) {
				strcon += intid[i] + " or note_table.noteid = ";
			} else {
				strcon += intid[i] + ")";
			}

		}

		for (int i = 1; i < strid.length; i++) { // Be careful, the index starts with "1" here!!
			if (i < strid.length - 1) {
				threadNoteQueryStr += intid[i] + " or thread_note.noteid = ";
			} else {
				threadNoteQueryStr += intid[i] + "";
			}

		}

		//get the notes from database
		/* sqls s = new sqls();
		Operatedb opdb = new Operatedb(s,database); */

		s = new sqls();
		opdb = new Operatedb(s, database);

		//using hashtable to store the note's relation
		ResultSet noters;
		String strtemp;
		String strtype = null;
		Hashtable<Integer, Vector<Integer>> butable = new Hashtable<Integer, Vector<Integer>>();
		Hashtable<Integer, Vector<Integer>> antable = new Hashtable<Integer, Vector<Integer>>();
		Hashtable<Integer, Vector<Integer>> retable = new Hashtable<Integer, Vector<Integer>>();

		for (int i = 1; i < strid.length; i++) {
			//query the database				

			strtemp = "fromnoteid = " + intid[i];
			noters = opdb.GetRecordsFromDB("note_note", "linktype,tonoteid", strtemp);

			//add to hash table
			Vector<Integer> anvec = new Vector<Integer>();
			Vector<Integer> buvec = new Vector<Integer>();
			Vector<Integer> revec = new Vector<Integer>();

			while (noters.next()) {
				strtype = noters.getString(1);
				if (strtype.equals("annotates")) {
					anvec.add(noters.getInt(2));
				} else if (strtype.equals("buildson")) {
					buvec.add(noters.getInt(2));
				} else if (strtype.equals("references")) {
					revec.add(noters.getInt(2));
				}
			}

			if (noters != null) {
				try {
					noters.close();
				} catch (SQLException e) {
					e.printStackTrace();
				}
			}
			antable.put(intid[i], anvec);
			butable.put(intid[i], buvec);
			retable.put(intid[i], revec);

		}
		Vector<Integer> vec;
/* System.out.println("***********4***********"); */
		String[] namearray = new String[20];

		namearray[0] = "thread_note";
		//传参
		String threadFocusName = threadName;
		strtemp = "thread_note.threadfocus='" + threadFocusName + "'";

		// Variables used for query
		ResultSet disrs = null;
		boolean threadIsPopulated = false;
		int numberOfTables = 2;
		String colNames = "note_table.noteid,note_table.notetitle,note_table.notecontent,note_table.createtime";

		disrs = opdb.MulGetRecordsFromDB(namearray, "projectid,threadfocus,note_id,highlight", strtemp, 1);
/* System.out.println("***********5***********"); */
		// Store state of highlight 
		Hashtable<Integer, Integer> idToHighlightMap = new Hashtable<Integer, Integer>();

		if (disrs != null && disrs.next()) {
			int rowcount = 0;

			do {
				idToHighlightMap.put(disrs.getInt(3), disrs.getInt(4));
				++rowcount;
			} while (disrs.next());

			// Assuming that ids are same, we could do a better job here where we go id by id
			if (rowcount == (strid.length - 1)) {
				//System.out.println("thread_note is already populated");
				threadIsPopulated = true;
			}
		}

		// Check if incoming ids are contained in the hashtable, if they do, do nothing, if not
		// then insert them with highlight state being 0 since we don't know anything about them (they are new)
		for (int i = 0; i < intid.length; ++i) {
			if (idToHighlightMap.containsKey(intid[i])) {
				// Do nothing since we already know about the state of highlight for this note id
			} else {
				idToHighlightMap.put(intid[i], 0);
			}
		}

		namearray[0] = "note_table";
		namearray[1] = "publish_author_note";


		strtemp = strcon
				+ " AND note_table.noteid=publish_author_note.noteid";
		if (threadIsPopulated) {
			namearray[2] = "thread_note";
			strtemp += " AND thread_note.note_id = note_table.noteid";
			colNames += ",thread_note.highlight";
			numberOfTables = 3;
		}
		strtemp += " GROUP BY note_table.noteid";
		//System.out.println("Query executed is: " + strtemp);

		// Check first if the thread_note alread contains entry entry for this note, if it does, then form a query 
		// that includes the thread_note or else, just use the query below.		
		disrs = opdb.MulGetRecordsFromDB(namearray, colNames, strtemp, numberOfTables);
//System.out.println("***********6***********");


%>

<!-- 定义超链接 -->
 <div id="fm">
		  <div id="threadinfo"></div>
	
	<ul id="flag">
	<li> This thread has <%=totalnotes %> nodes&nbsp;&nbsp;&nbsp;</li>
		<li id="showalltitle">&nbsp;|&nbsp;<a href="javascript:void(0)" onclick="tg.toggleTitles(this)";>Show Title</a>&nbsp;|&nbsp;</li>
		<li id="showallauthor"><a href="javascript:void(0)" onclick="tg.toggleAuthors(this)">Show Author</a>&nbsp;|&nbsp;</li>
		<li id="showalllink"><a id ="showalllinkbuildon" href="javascript:void(0)" onclick="tg.toggleLinks(this, 'buildons', $('#alertDialog'));">Show Build-on</a>&nbsp;|&nbsp;
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
	</ul>

</div>


<!-- <div id="up_area"> -->

<!-- node边框 -->
<div id="wrapper_draw">
		  <div id="right_area">
		     
		     <div id="thread_vis"></div>
		     <div id="slider" style="width: 830px;position:absolute;top:392px;left:50px"></div>
	     </div>
</div>
<div id="notes_slide"><div id="impress"></div></div>


<!-- -----显示node的信息------ -->
		<div id="noteid_with_timestamp" value=<%=nidts_str%> ></div>
	    <div id="raw_area">
		<% 	
			while(disrs.next())
			{
				/* System.out.println("******************************************************************");
				System.out.println(disrs.getInt(1));
				System.out.println(disrs.getString(2));
				System.out.println(disrs.getString(3));
				System.out.println(disrs.getString(4));
				System.out.println("******************************************************************");
				 */
				String highlighted = "0";
				//highlighted = Integer.toString(idToHighlightMap.get(disrs.getInt(1)));
				
				
		%>
			<div class="rawnote" highlight="<%=highlighted %>" noteid="<%=disrs.getString(1)%>" view="" author="<%List authorList = opdb_author.getMultipleAuthors(disrs.getString(1));
					  for(int i=0;i<authorList.size();i++){
						  String name = (String)authorList.get(i);%>
						  <%=name %>
						  <%if(i < authorList.size()-1){
						  %>
						  ,&nbsp;
						  <%}%>	  
					  <%}%>" firstn="" date="<%=disrs.getString(4)%>">
			
			
			
			
			<div class="references">
			</div>
			<div class="buildsons">
				<%vec = butable.get(disrs.getInt(1));
				  for(int i=0; i<vec.size();i++){
				  //System.out.println("buildson:	from note "+disrs.getInt(1)+" to note " + vec.get(i));%>
				  	<div class="buildson" target="<%=vec.get(i)%>"> 
					</div>
				<%	  
				  }
				  vec.clear();
				%>			
			</div>
			<div class="annotates">
			</div>
			<div class="rawtitle"><%=disrs.getString(2)%></div>
 			<div class="rawcontent"> <%=disrs.getString(3)%>
				
			</div> 
		</div>
		<% 
		}
		%>
</div>
<% 
	if(disrs != null){
		try {
			disrs.close();
		} catch(SQLException e){
			e.printStackTrace();
		}
	} 
   if (opdb != null) {
       opdb.CloseCon();
   }

   if (opdb_author != null) {
       opdb_author.CloseCon();
   }
}
///数据库没有数据时显示空表
	else{
		
		
		%>
		<!-- 定义超链接 -->
 		<div id="fm">
		  <div id="threadinfo"></div>
	
	<ul id="flag">
	<li>This thread has <%=totalnotes %> nodes&nbsp;&nbsp;&nbsp;</li>
		<li id="showalltitle">&nbsp;|&nbsp;<a href="javascript:void(0)" >Show Title</a>&nbsp;|&nbsp;</li>
		<li id="showallauthor"><a href="javascript:void(0)" >Show Author</a>&nbsp;|&nbsp;</li>
		<li id="showalllink"><a id ="showalllinkbuildon" href="javascript:void(0)" >Show Build-on</a>&nbsp;|&nbsp;
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</li>
	</ul>

	</div>

	<!-- node边框 -->
		<div id="wrapper_draw">
		  <div id="right_area">
		     
		     <div id="thread_vis"></div>
		     <div id="slider" style="width: 830px;position:absolute;top:392px;left:50px"></div>
	     </div>
		</div>
		<div id="notes_slide"><div id="impress"></div></div>
		<div id="noteid_with_timestamp" value="" ></div>
	    <div id="raw_area">
			<div class="rawnote" highlight="" noteid="" view="" author="" firstn="" date="">
			
			<div class="references"></div>
			<div class="buildsons"></div>
			<div class="annotates"></div>
			<div class="rawtitle"></div>
 			<div class="rawcontent"> </div> 
		</div>
		</div>
		<% 
		
		
	}
%>

</body>
</html>