-- Comprehensive IT Skills Taxonomy Seed
-- This migration seeds the skills table with a comprehensive set of IT skills

-- Clear existing skills (optional - remove if you want to keep existing data)
-- DELETE FROM position_requirements;
-- DELETE FROM cv_skills;
-- DELETE FROM skills;

-- Programming Languages
INSERT INTO skills (name, category, aliases, description, is_current, related_skills) VALUES
('JavaScript', 'programming_language', ARRAY['JS', 'ECMAScript', 'ES6', 'ES2015', 'ES2020'], 'Web programming language', true, '{}'),
('TypeScript', 'programming_language', ARRAY['TS'], 'Typed superset of JavaScript', true, '{}'),
('Python', 'programming_language', ARRAY['Python3', 'Py', 'Python 3'], 'General-purpose programming language', true, '{}'),
('Java', 'programming_language', ARRAY['J2EE', 'JavaSE', 'JavaEE', 'Java SE', 'Java EE'], 'Object-oriented programming language', true, '{}'),
('C#', 'programming_language', ARRAY['CSharp', 'C Sharp', '.NET', 'DotNet'], 'Microsoft programming language', true, '{}'),
('Go', 'programming_language', ARRAY['Golang'], 'Google programming language', true, '{}'),
('Rust', 'programming_language', ARRAY[], 'Systems programming language', true, '{}'),
('Ruby', 'programming_language', ARRAY[], 'Dynamic programming language', true, '{}'),
('PHP', 'programming_language', ARRAY[], 'Server-side scripting language', true, '{}'),
('Scala', 'programming_language', ARRAY[], 'JVM programming language', true, '{}'),
('Kotlin', 'programming_language', ARRAY[], 'JVM programming language for Android', true, '{}'),
('Swift', 'programming_language', ARRAY[], 'Apple programming language', true, '{}'),
('SQL', 'programming_language', ARRAY['T-SQL', 'PL/SQL', 'Structured Query Language'], 'Database query language', true, '{}'),
('C++', 'programming_language', ARRAY['CPP', 'C Plus Plus'], 'Systems programming language', true, '{}'),
('C', 'programming_language', ARRAY[], 'Low-level programming language', true, '{}'),
('R', 'programming_language', ARRAY[], 'Statistical programming language', true, '{}'),
('MATLAB', 'programming_language', ARRAY[], 'Numerical computing language', true, '{}'),
('Perl', 'programming_language', ARRAY[], 'Text processing language', true, '{}'),
('Elixir', 'programming_language', ARRAY[], 'Functional programming language', true, '{}'),
('Clojure', 'programming_language', ARRAY[], 'Lisp dialect for JVM', true, '{}')
ON CONFLICT (name) DO NOTHING;

-- Frontend Frameworks & Libraries
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('React', 'framework', ARRAY['ReactJS', 'React.js'], 'Frontend JavaScript library', true),
('Vue.js', 'framework', ARRAY['Vue', 'VueJS', 'Vue 3'], 'Frontend JavaScript framework', true),
('Angular', 'framework', ARRAY['Angular2+', 'AngularJS', 'Angular 2', 'Angular 16'], 'Frontend TypeScript framework', true),
('Next.js', 'framework', ARRAY['NextJS', 'Next'], 'React framework for production', true),
('Svelte', 'framework', ARRAY['SvelteKit'], 'Frontend compiler framework', true),
('Redux', 'framework', ARRAY['React Redux', 'Redux Toolkit'], 'State management library', true),
('Tailwind CSS', 'framework', ARRAY['TailwindCSS', 'Tailwind'], 'Utility-first CSS framework', true),
('Bootstrap', 'framework', ARRAY[], 'CSS framework', true),
('Material-UI', 'framework', ARRAY['MUI', 'Material UI'], 'React component library', true),
('Chakra UI', 'framework', ARRAY[], 'React component library', true),
('Styled Components', 'framework', ARRAY['styled-components'], 'CSS-in-JS library', true),
('SASS', 'framework', ARRAY['SCSS'], 'CSS preprocessor', true),
('LESS', 'framework', ARRAY[], 'CSS preprocessor', true),
('jQuery', 'framework', ARRAY[], 'JavaScript library', false),
('Ember.js', 'framework', ARRAY['EmberJS', 'Ember'], 'Frontend framework', true),
('Backbone.js', 'framework', ARRAY['BackboneJS'], 'Frontend framework', false)
ON CONFLICT (name) DO NOTHING;

-- Backend Frameworks
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Node.js', 'framework', ARRAY['NodeJS', 'Node'], 'JavaScript runtime', true),
('Express.js', 'framework', ARRAY['Express', 'ExpressJS'], 'Node.js web framework', true),
('Spring Boot', 'framework', ARRAY['Spring', 'SpringBoot'], 'Java application framework', true),
('Django', 'framework', ARRAY[], 'Python web framework', true),
('Flask', 'framework', ARRAY[], 'Python micro framework', true),
('FastAPI', 'framework', ARRAY[], 'Python async framework', true),
('ASP.NET', 'framework', ARRAY['ASP.NET Core', '.NET Core', 'ASP.NET MVC'], 'Microsoft web framework', true),
('Ruby on Rails', 'framework', ARRAY['Rails', 'RoR'], 'Ruby web framework', true),
('NestJS', 'framework', ARRAY['Nest'], 'Node.js TypeScript framework', true),
('Laravel', 'framework', ARRAY[], 'PHP web framework', true),
('Symfony', 'framework', ARRAY[], 'PHP framework', true),
('Gin', 'framework', ARRAY['Gin Gonic'], 'Go web framework', true),
('Echo', 'framework', ARRAY[], 'Go web framework', true),
('Phoenix', 'framework', ARRAY[], 'Elixir web framework', true),
('Actix', 'framework', ARRAY[], 'Rust web framework', true)
ON CONFLICT (name) DO NOTHING;

-- Databases
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('PostgreSQL', 'database', ARRAY['Postgres', 'PG', 'PSQL'], 'Relational database', true),
('MySQL', 'database', ARRAY['MariaDB'], 'Relational database', true),
('MongoDB', 'database', ARRAY['Mongo'], 'NoSQL document database', true),
('Redis', 'database', ARRAY[], 'In-memory data store', true),
('Elasticsearch', 'database', ARRAY['ES', 'Elastic'], 'Search and analytics engine', true),
('DynamoDB', 'database', ARRAY['AWS DynamoDB'], 'AWS NoSQL database', true),
('Oracle', 'database', ARRAY['Oracle DB', 'Oracle Database'], 'Enterprise relational database', true),
('SQL Server', 'database', ARRAY['MSSQL', 'Microsoft SQL Server', 'MS SQL'], 'Microsoft relational database', true),
('Cassandra', 'database', ARRAY['Apache Cassandra'], 'Distributed NoSQL database', true),
('CouchDB', 'database', ARRAY[], 'NoSQL document database', true),
('Neo4j', 'database', ARRAY[], 'Graph database', true),
('InfluxDB', 'database', ARRAY[], 'Time series database', true),
('TimescaleDB', 'database', ARRAY[], 'Time series database', true),
('Snowflake', 'database', ARRAY[], 'Cloud data warehouse', true),
('BigQuery', 'database', ARRAY['Google BigQuery'], 'Google cloud data warehouse', true),
('Redshift', 'database', ARRAY['AWS Redshift', 'Amazon Redshift'], 'AWS data warehouse', true),
('Supabase', 'database', ARRAY[], 'Open source Firebase alternative', true),
('Firebase', 'database', ARRAY[], 'Google mobile/web app platform', true)
ON CONFLICT (name) DO NOTHING;

-- Cloud Platforms
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('AWS', 'cloud', ARRAY['Amazon Web Services', 'Amazon AWS'], 'Amazon cloud platform', true),
('Azure', 'cloud', ARRAY['Microsoft Azure', 'Azure Cloud'], 'Microsoft cloud platform', true),
('GCP', 'cloud', ARRAY['Google Cloud', 'Google Cloud Platform'], 'Google cloud platform', true),
('Heroku', 'cloud', ARRAY[], 'Platform as a Service', true),
('Vercel', 'cloud', ARRAY[], 'Frontend cloud platform', true),
('Netlify', 'cloud', ARRAY[], 'Web hosting platform', true),
('DigitalOcean', 'cloud', ARRAY[], 'Cloud infrastructure provider', true),
('Linode', 'cloud', ARRAY[], 'Cloud hosting', true),
('Cloudflare', 'cloud', ARRAY[], 'CDN and security platform', true)
ON CONFLICT (name) DO NOTHING;

-- AWS Services (commonly requested)
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('EC2', 'cloud', ARRAY['AWS EC2', 'Amazon EC2', 'Elastic Compute Cloud'], 'AWS compute service', true),
('S3', 'cloud', ARRAY['AWS S3', 'Amazon S3', 'Simple Storage Service'], 'AWS storage service', true),
('Lambda', 'cloud', ARRAY['AWS Lambda'], 'AWS serverless compute', true),
('RDS', 'cloud', ARRAY['AWS RDS'], 'AWS relational database service', true),
('CloudFormation', 'cloud', ARRAY['AWS CloudFormation'], 'AWS infrastructure as code', true),
('ECS', 'cloud', ARRAY['AWS ECS', 'Elastic Container Service'], 'AWS container service', true),
('EKS', 'cloud', ARRAY['AWS EKS', 'Elastic Kubernetes Service'], 'AWS managed Kubernetes', true)
ON CONFLICT (name) DO NOTHING;

-- DevOps & Infrastructure
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Docker', 'devops', ARRAY['Containers'], 'Container platform', true),
('Kubernetes', 'devops', ARRAY['K8s', 'K8'], 'Container orchestration', true),
('Terraform', 'devops', ARRAY['TF'], 'Infrastructure as Code', true),
('Ansible', 'devops', ARRAY[], 'Configuration management', true),
('Jenkins', 'devops', ARRAY[], 'CI/CD automation server', true),
('GitHub Actions', 'devops', ARRAY['GHA'], 'GitHub CI/CD', true),
('GitLab CI', 'devops', ARRAY['GitLab CI/CD'], 'GitLab CI/CD', true),
('CircleCI', 'devops', ARRAY[], 'CI/CD platform', true),
('Travis CI', 'devops', ARRAY[], 'CI/CD platform', true),
('Prometheus', 'devops', ARRAY[], 'Monitoring system', true),
('Grafana', 'devops', ARRAY[], 'Observability platform', true),
('ELK Stack', 'devops', ARRAY['Elastic Stack', 'Elasticsearch Logstash Kibana'], 'Logging stack', true),
('Datadog', 'devops', ARRAY[], 'Monitoring and analytics', true),
('New Relic', 'devops', ARRAY[], 'Application performance monitoring', true),
('Splunk', 'devops', ARRAY[], 'Log analysis platform', true),
('Nagios', 'devops', ARRAY[], 'Monitoring system', true),
('Puppet', 'devops', ARRAY[], 'Configuration management', true),
('Chef', 'devops', ARRAY[], 'Configuration management', true),
('Consul', 'devops', ARRAY[], 'Service mesh and discovery', true),
('Vault', 'devops', ARRAY['HashiCorp Vault'], 'Secrets management', true)
ON CONFLICT (name) DO NOTHING;

-- Testing Tools & Frameworks
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Jest', 'testing', ARRAY[], 'JavaScript testing framework', true),
('Cypress', 'testing', ARRAY[], 'End-to-end testing framework', true),
('Selenium', 'testing', ARRAY[], 'Browser automation', true),
('JUnit', 'testing', ARRAY[], 'Java testing framework', true),
('PyTest', 'testing', ARRAY['pytest'], 'Python testing framework', true),
('Playwright', 'testing', ARRAY[], 'Browser automation', true),
('Mocha', 'testing', ARRAY[], 'JavaScript testing framework', true),
('Chai', 'testing', ARRAY[], 'JavaScript assertion library', true),
('TestNG', 'testing', ARRAY[], 'Java testing framework', true),
('Jasmine', 'testing', ARRAY[], 'JavaScript testing framework', true),
('Postman', 'testing', ARRAY[], 'API testing tool', true),
('K6', 'testing', ARRAY[], 'Load testing tool', true),
('JMeter', 'testing', ARRAY['Apache JMeter'], 'Performance testing tool', true)
ON CONFLICT (name) DO NOTHING;

-- Methodologies & Practices
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Agile', 'methodology', ARRAY['Agile Methodology'], 'Agile development methodology', true),
('Scrum', 'methodology', ARRAY[], 'Agile framework', true),
('Kanban', 'methodology', ARRAY[], 'Lean workflow method', true),
('TDD', 'methodology', ARRAY['Test Driven Development'], 'Test-first development', true),
('BDD', 'methodology', ARRAY['Behavior Driven Development'], 'Behavior-first development', true),
('CI/CD', 'methodology', ARRAY['Continuous Integration', 'Continuous Deployment'], 'Continuous integration and deployment', true),
('DevOps', 'methodology', ARRAY[], 'Development and operations culture', true),
('Microservices', 'methodology', ARRAY['Microservice Architecture'], 'Distributed architecture pattern', true),
('Event Driven Architecture', 'methodology', ARRAY['EDA'], 'Event-based architecture', true),
('Domain Driven Design', 'methodology', ARRAY['DDD'], 'Software design approach', true),
('Clean Architecture', 'methodology', ARRAY[], 'Software architecture pattern', true),
('SOLID Principles', 'methodology', ARRAY['SOLID'], 'Object-oriented design principles', true)
ON CONFLICT (name) DO NOTHING;

-- Message Queues & Streaming
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Kafka', 'messaging', ARRAY['Apache Kafka'], 'Event streaming platform', true),
('RabbitMQ', 'messaging', ARRAY['Rabbit MQ'], 'Message broker', true),
('SQS', 'messaging', ARRAY['Amazon SQS', 'AWS SQS'], 'AWS message queue', true),
('ActiveMQ', 'messaging', ARRAY[], 'Message broker', true),
('ZeroMQ', 'messaging', ARRAY[], 'Messaging library', true),
('NATS', 'messaging', ARRAY[], 'Messaging system', true),
('Pulsar', 'messaging', ARRAY['Apache Pulsar'], 'Event streaming platform', true)
ON CONFLICT (name) DO NOTHING;

-- API Technologies
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('REST', 'api', ARRAY['REST API', 'RESTful', 'RESTful API'], 'API architectural style', true),
('GraphQL', 'api', ARRAY['GQL'], 'Query language for APIs', true),
('gRPC', 'api', ARRAY[], 'High-performance RPC framework', true),
('WebSocket', 'api', ARRAY['WebSockets', 'WS'], 'Real-time communication protocol', true),
('SOAP', 'api', ARRAY[], 'Web services protocol', true),
('OpenAPI', 'api', ARRAY['Swagger'], 'API specification', true),
('Postman', 'api', ARRAY[], 'API development tool', true)
ON CONFLICT (name) DO NOTHING;

-- Version Control
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Git', 'tool', ARRAY[], 'Version control system', true),
('GitHub', 'tool', ARRAY[], 'Git hosting platform', true),
('GitLab', 'tool', ARRAY[], 'Git hosting and CI/CD platform', true),
('Bitbucket', 'tool', ARRAY[], 'Git hosting platform', true),
('SVN', 'tool', ARRAY['Subversion'], 'Version control system', false),
('Mercurial', 'tool', ARRAY[], 'Version control system', false)
ON CONFLICT (name) DO NOTHING;

-- Data Science & ML
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Machine Learning', 'data_science', ARRAY['ML'], 'Machine learning techniques', true),
('Deep Learning', 'data_science', ARRAY['DL'], 'Neural networks', true),
('TensorFlow', 'framework', ARRAY['TF'], 'Machine learning framework', true),
('PyTorch', 'framework', ARRAY[], 'Machine learning framework', true),
('Scikit-learn', 'framework', ARRAY['sklearn'], 'Machine learning library', true),
('Pandas', 'framework', ARRAY[], 'Data analysis library', true),
('NumPy', 'framework', ARRAY[], 'Numerical computing library', true),
('Keras', 'framework', ARRAY[], 'Neural network API', true),
('Jupyter', 'tool', ARRAY['Jupyter Notebook'], 'Interactive computing', true),
('Apache Spark', 'framework', ARRAY['Spark', 'PySpark'], 'Distributed computing', true),
('Hadoop', 'framework', ARRAY['Apache Hadoop'], 'Big data framework', true),
('Airflow', 'framework', ARRAY['Apache Airflow'], 'Workflow orchestration', true)
ON CONFLICT (name) DO NOTHING;

-- Mobile Development
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('React Native', 'framework', ARRAY['RN'], 'Cross-platform mobile framework', true),
('Flutter', 'framework', ARRAY[], 'Cross-platform mobile framework', true),
('iOS Development', 'mobile', ARRAY['iOS'], 'Apple mobile development', true),
('Android Development', 'mobile', ARRAY['Android'], 'Google mobile development', true),
('SwiftUI', 'framework', ARRAY[], 'iOS UI framework', true),
('Jetpack Compose', 'framework', ARRAY[], 'Android UI framework', true),
('Xamarin', 'framework', ARRAY[], 'Cross-platform mobile framework', true),
('Ionic', 'framework', ARRAY[], 'Hybrid mobile framework', true)
ON CONFLICT (name) DO NOTHING;

-- Update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_name_lower ON skills(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_is_current ON skills(is_current);
