package com.groupe.gestion_clinic.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/hello")
    public String hello() {
        return "Backend fonctionne !";
    }

    @PostMapping("/login-test")
    public String testLogin(@RequestBody Object request) {
        System.out.println("Test login recu: " + request);
        return "Login test OK";
    }
}