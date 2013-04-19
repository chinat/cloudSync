#ifndef HTTP_H
#define HTTP_H

#include <QUrl>
#include <QString>
#include <QVariant>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QNetworkAccessManager>

#include "utils.h"

namespace Http {

class Http : public QObject {
    Q_OBJECT
public :
    enum Action {
        GET = 1,
        POST,
        DELETE,
        PATCH
    };
    
    Http(QObject *parent = NULL):QObject(parent) {
        manager = new QNetworkAccessManager(parent);
//        // trans signals
//        connect(manager, &QNetworkAccessManager::finished, [](QNetworkReply *reply){
//            QNetworkReply *reply;
//            QMap<QString, QVariant> ret;
//            // here need to convert string to json
//            ret["data"] = reply->readAll();
            
//            for(QByteArray name: reply->rawHeaderList() ) {
//                if(!(reply->rawHeader(name).isNull() || reply->rawHeader(name).isEmpty())) {
//                    ret[QString(name)] = reply->rawHeader(name);
//                }
//            }
//            emit finished(ret);
//            reply->deleteLater();
//        });
    }
    
    ~Http(){
        delete manager;
    }
    
    QNetworkReply * GET(QNetworkRequest &request) {
        return manager->get(request);
    }
    
    QNetworkReply * POST(QNetworkRequest &request, const QByteArray &data) {
        return manager->post(request, data);
    }
    
    QNetworkReply * PATCH(QNetworkRequest &request, const QByteArray &data) {
        return manager->post(request, data);
    }
    
    QNetworkReply * DELETE(QNetworkRequest &request) {
        return manager->deleteResource(request);
    }
    
protected :
    QNetworkAccessManager * manager;
Q_SIGNALS:
//    void finished(QMap<QString, QVariant> ret);
};

}

#endif // HTTP_H
