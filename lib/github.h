#ifndef GITHUB_H
#define GITHUB_H

#include <QMap>
#include <QStringList>
#include <QString>
#include <functional>

#include <QNetworkAccessManager>
#include <QNetworkReply>

#include "http.h"

namespace GitHub {

const QString VERSION {"3.0.0"};
const QString prefix {"https://api.github.com"};

class User : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString name WRITE setname)
    Q_PROPERTY(QString passwd WRITE setpasswd)
public :
    enum TYPE  {
        BASIC,
        OAUTH
    };
    
    User(QObject * parent = NULL): QObject(parent) {
        handle["get"] = [](QString param) {
            
            return 0;
        };
        
        handle["update"] = [](QString param) {
            return 0;
        }; 
        
        handle["getOrgs"] = [](QString param) {
            
            return 0;
        };
        
        handle["getEmails"] = [](QString param) {
            return 0;
        };
        
        handle["addEmails"] = [](QString param) {
            
            return 0;
        };
        
        handle["deleteEmails"] = [](QString param) {
            
            return 0;
        };
        
        handle["getFollowers"] = [](QString param) {
            
            return 0;
        };
        
        handle["getKeys"] = [](QString param) {
            
            return 0;
        };
        
        handle["getKey"] = [](QString param) {
            
            return 0;
        };
        
        handle["createKey"] = [](QString param) {
            return 0;
        };
        
        handle["updateKey"] = [](QString param) {
            return 0;
        };
        
        handle["deleteKey"] = [](QString param) {
            
            return 0;
        };
    }
    
    
    QMap <QString, std::function<int(QString)>>  handle ;
    
public Q_SLOTS:
    void setToken(QString token);
    void httpSend(QString msg);
private :
    QString name;
    QString passwd;
    QString token;
};


class Authorization : public QObject {
    Q_OBJECT
    
public:
    Authorization(QObject * parent = NULL):QObject(parent) {
        /** 
         *  GET /authorizations/:id
         *  scopes: 
         *  method: basic 
         */
        handle["get"] = [](QString param) {
            QString route = "/authorizations/:id";
            Http::Action action = Http::GET;
            
            return 0;
        };
        
        /**
         *  GET /authorizations
         *  scopes: "user", "public_repo", "repo", "repo:status", "delete_repo", "gist"
         *  method: basic
         */
        handle["getAll"] = [](QString param) {
            QString route = "/authorizations";
            Http::Action action = Http::GET;
            return 0;
        };
        
        /**
         *  POST /authorizations
         *  scopes: 
         *  method: basic
         *  Input: 
         *        scopes:[](opt)
         *        note: str(opt)
         *        note_url: str(opt)
         *        client_id: str(opt)
         *        client_secret: str(opt)
         */
        handle["create"] = [](QString param) {
            QString route = "/authorizations";
            Http::Action action = Http::POST;
            Http *http = new Http(QUrl(QS), this);
            connect(http, &Http::finished, [=](QMap<QString, QVariant> ret){
                
            });
            
            http->setHeader("Authorization", "base");
            
            return 0;
        };
        
        /**
          *  PATCH /authorizations/:id
          *  scopes:
         *  method: basic
          */
        handle["update"] = [](QString param) {
            QString route = "/authorizations/:id";
            Http::Action action = Http::PATCH;
            return 0;
        };
        
        /**
          *  DELETE /authorizations/:id
          *  scopes:
          */
        handle["delete"] = [](QString param) {
            QString route = "/authorizations/:id";
            Http::Action action = Http::DELETE;
            
            
            return 0;
        };
        
        /**
          * GET /applications/:client_id/tokens/:access_token
          */
        handle["check"] = [](QString param) {
            QString route = "/applications/:client_id/tokens/:access_token";
            Http::Action action = Http::GET;
            
            return 0;
        };
    }
    
    QStringList scopes{"user", "user:email", "user:follow", "public_repo", "repo", 
                       "repo:status", "delete_repo", "notifications", "gist"};
    
    QMap<QString, std::function<int(QString)> handle;
};

}

#endif // GITHUB_H
