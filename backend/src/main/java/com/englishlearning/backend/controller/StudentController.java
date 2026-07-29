package com.englishlearning.backend.controller;


import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello authenticated user";
    }
}
