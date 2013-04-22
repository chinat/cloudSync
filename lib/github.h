#ifndef GITHUB_H
#define GITHUB_H

#include <QMap>
#include <QStringList>
#include <QString>
#include <functional>

#include <QNetworkAccessManager>
#include <QNetworkReply>

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonValue>

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
        http = new Http::Http(this);
        
        handle["get"] = [&](QString param) {
            
            return 0;
        };
        
        handle["update"] = [&](QString param) {
            return 0;
        }; 
        
        handle["getOrgs"] = [&](QString param) {
            
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
        
        /**
          *  list current use's key 
          *  GET /user/keys
          *  method basic or OAuth with user scope
          *  param 
          *        token 
          *      or
          *        username
          *        passwd
          */
        handle["getKeys"] = [](QString param) {
            QString route = "/usr/keys";
            
            
            return 0;
        };
        
        handle["getKey"] = [](QString param) {
            
            return 0;
        };
        
        /**
          *  add ssh public key to github
          *  POST /usr/keys
          *  method basic
          *  param
          *        title
          *        key
          *        username
          *        passwd
          * 
          *  steps:
          *    checkout if this ssh has added to github 
          *        on linux, /home/user/.ssh/id_rsa.pub
          */
        handle["createKey"] = [&](Map &param) {
            QString route = "/user/keys";
            Map param;
            //param check
            if(!param.contains("username") || !param.contains("passwd") || !param.contains("key")) {
                Map ret;
                ret["_state"] = 1;
                ret["_message"] = "username or password is need";
                return 1;
            }
            if(!param.contains("title")) {
                param["title"] = "GitHub lib base on qt";
            }
            
            QJsonValue title(param["title"]);
            QJsonValue key(param["key"]);
            QJsonObject obj;
            obj.insert("title", title);
            obj.insert("key", key);
            QJsonDocument data(obj);
            
            QNetworkRequest request(QUrl(QString("%1%2").arg(prefix).arg(route)));
            request.setRawHeader("Authorization", "Basic " + QByteArray(QString("%1:%2").arg(param["username"]).arg(param["passwd"]).toLatin1().toBase64()));  
            QNetworkReply *reply = http->POST(request, data.toJson());
            connect(reply, &QNetworkReply::finished, [&](){
                // string to json
                QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
                QJsonObject data = doc.object();
                Map ret;
                for(QByteArray key : param.keys()) {
                    if(data.contains(QString(key))) {
                        ret[key] = data[key];
                    }
                    else if(reply->rawHeaderList().contains(key)) {
                        ret[key] = reply->rawHeader(key);
                    }
                }
                if(ret.contains("_state")) 
                    ret["_state_"] = 0;
                else
                    ret["_state"] = 0;
                
                emit result(ret);
                reply->deleteLater();
            });
            
            
            return 0;
        };
        
        
        handle["updateKey"] = [&](QString param) {
            return 0;
        };
        
        handle["deleteKey"] = [&](QString param) {
            
            return 0;
        };
    }
    
protected:
    QMap<QString, std::function<int(Map&)> handle;
    Http::Http *http;


};


class Authorization : public QObject {
    Q_OBJECT
public:
    Authorization(QObject * parent = NULL):QObject(parent) {
        http = new Http::Http(this);
        
        /** 
         *  GET /authorizations/:id
         *  scopes: 
         *  method: basic 
         *  param
         *        username
         *        passwd
         *        id
         */
        handle["get"] = [&](Map param) {
            QString route = "/authorizations/:id";
            
            
            return 0;
        };
        
        /**
         *  GET /authorizations
         *  scopes: "user", "public_repo", "repo", "repo:status", "delete_repo", "gist"
         *  method: basic
         *  param
         *        username
         *        passwd
         */
        handle["getAll"] = [&](Map param) {
            QString route = "/authorizations";
            
            return 0;
        };
        
        /**
         *  POST /authorizations
         *  scopes: 
         *  method: basic
         *  param
         *        username
         *        passwd
         *        contentTypeHeader
         */
        handle["create"] = [&](Map &param) {
            QString route = "/authorizations";
            //param check
            if(!param.contains("username") || !param.contains("passwd")) {
                Map ret;
                ret["_state"] = 1;
                ret["_message"] = "username or password is need";
                return 1;
            }
            
            QJsonArray scopes = QJsonArray::fromStringList(scopes);
            QJsonValue note("From GitHub Qt lib v0.1");
            QJsonValue note_utl("http://127.0.0.1");
            QJsonObject obj;
            obj.insert("scopes", scopes);
            obj.insert("note", note);
            obj.insert("note_url", note_utl);
            QJsonDocument data(obj);
            
            QNetworkRequest request(QUrl(QString("%1%2").arg(prefix).arg(route)));
            
            //set http content type
            if(param.contains("contentTypeHeader")) 
                request.setHeader(QNetworkRequest::ContentTypeHeader, param["contentTypeHeader"]);
            else 
                request.setHeader(QNetworkRequest::ContentTypeHeader, param.contains("application/json"));
            
            request.setRawHeader("Authorization", "Basic " + QByteArray(QString("%1:%2").arg(param["username"]).arg(param["passwd"]).toLatin1().toBase64()));    
            QNetworkReply *reply = http->POST(request, data.toJson());
            
            connect(reply, &QNetworkReply::finished, [&]() {
                // string to json
                QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
                QJsonObject data = doc.object();
                Map ret;
                for(QByteArray key : param.keys()) {
                    if(data.contains(QString(key))) {
                        ret[key] = data[key];
                    }
                    else if(reply->rawHeaderList().contains(key)) {
                        ret[key] = reply->rawHeader(key);
                    }
                }
                if(ret.contains("_state")) 
                    ret["_state_"] = 0;
                else
                    ret["_state"] = 0;
                
                emit result(ret);
                reply->deleteLater();
            });
            return 0;
        };
        
        /**
          *  PATCH /authorizations/:id
          *  scopes:
          *  method: basic
          *  param
          *        username
          *        passwd
          *        id
          */
        handle["update"] = [&](Map param) {
            QString route = "/authorizations/:id";
            
            
            return 0;
        };
        
        /**
          *  DELETE /authorizations/:id
          *  scopes:
          *  param
          *        username
          *        passwd
          */
        handle["delete"] = [&](QString param) {
            QString route = "/authorizations/:id";
            
            return 0;
        };
        
        /**
          * GET /applications/:client_id/tokens/:access_token
          */
        handle["check"] = [&](Map param) {
            QString route = "/applications/:client_id/tokens/:access_token";
            
            
            return 0;
        };
    }
    
    
protected:
    QStringList scopes{"user", "user:email", "user:follow", "public_repo", "repo", 
                       "repo:status", "delete_repo", "notifications", "gist"};
    
    QMap<QString, std::function<int(Map&)> handle;
    Http::Http *http;
    
Q_SIGNALS:
    // delete later
    void finished(Map map);
    
};

}

#endif // GITHUB_H
