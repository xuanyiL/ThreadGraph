package com.web.controller.annotation;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class UserController {

//	@RequestMapping(value = "/user/addUser", method = RequestMethod.POST)
//	public ModelAndView addUser() {
//		String result = "add user";
//		return new ModelAndView("/annotation", "result", result);
//	}
//
//	@RequestMapping(value = "/user/delUser", method = RequestMethod.GET)
//	public ModelAndView delUser() {
//		String result = "delete user";
//		return new ModelAndView("/annotation", "result", result);
//	}

	@RequestMapping(value = "/toThread", method = RequestMethod.GET)
	public ModelAndView toUser() {

		return new ModelAndView("/thread9");
	}
}
