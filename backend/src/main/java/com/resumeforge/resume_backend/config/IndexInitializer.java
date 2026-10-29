package com.resumeforge.resume_backend.config;

import com.resumeforge.resume_backend.model.Resume;
import com.resumeforge.resume_backend.model.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

@Component
public class IndexInitializer {

    public IndexInitializer(MongoTemplate mongo) {
        mongo.indexOps(User.class)
                .createIndex(new Index().on("email", Sort.Direction.ASC).unique());
        mongo.indexOps(Resume.class)
                .createIndex(new Index().on("userId", Sort.Direction.ASC));
    }
}
