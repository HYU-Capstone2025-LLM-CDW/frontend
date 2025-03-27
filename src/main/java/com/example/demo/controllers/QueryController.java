package com.example.demo.controllers;

import com.example.demo.services.QueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class QueryController {

    @Autowired
    private QueryService queryService;

    @PostMapping("/execute-query")
    public Map<String, Object> executeQuery(@RequestBody Map<String, String> request) {
        String sql = request.get("sql");
        List<Map<String, Object>> queryResult = queryService.executeQuery(sql);
        Map<String, Object> response = new HashMap<>();
        response.put("data", queryResult);
        return response;
    }
}
